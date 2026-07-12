# Server-side inanimate transform contract

The browser cannot make a durable inanimate transformation by itself. After reload,
the client rebuilds `GAME_MANAGER.instance.character` from the server payload.
For a real transformation, the server must persist the item form and owner, then
send the normal client update shape.

## Client command

`SELFTF_MASTER.js` now exposes:

```js
SELFTF.serverTransform({
  targetToken: GAME_MANAGER.instance.character.token,
  ownerToken: "d97387afa03b7445dc56f588be3269314ab0019f",
  baseId: 82,
  itemName: "Celinas-Cumcovered Slutty-Thong",
  color: "Lime",
  permanent: true,
  sealed: false
});
```

It sends this websocket request:

```json
{
  "action": "DevSetInanimate",
  "targetToken": "target character token",
  "ownerToken": "owner character token",
  "baseId": 82,
  "itemName": "Celinas-Cumcovered Slutty-Thong",
  "color": "Lime",
  "permanent": true,
  "sealed": false,
  "variantAccessory": null,
  "reason": "dev-selftf",
  "id": 123
}
```

## Required server behavior

Only allow this action for trusted developer/admin sessions.

1. Resolve `targetToken` to the transformed character.
2. Resolve `ownerToken` to the owner character.
3. Validate `baseId` exists and is an item base that can represent an inanimate form.
4. Create a real item row owned/equipped by the owner.
5. Store the transformed character's inanimate pointer to that item.
6. Store the item character metadata:

```json
{
  "permanent": true,
  "sealed": false,
  "name": "Celinas-Cumcovered Slutty-Thong",
  "nature": "target nature",
  "id_token": "target character token"
}
```

7. Attach standard `inanimate_actions` to the item, or derive them server-side.
8. Add/update countdown `recentlyTransformed` if your normal transformation path does.
9. Send the normal client update payload to the transformed character.
10. Send inventory/location updates to the owner and nearby players as needed.

## Payload the client already supports

The existing client code in `GameManager.1748712111.js` already handles this:

```json
{
  "character": {
    "item": {
      "id": 1234567,
      "stack": 0,
      "base": 82,
      "flags": 0,
      "character": {
        "permanent": true,
        "sealed": false,
        "name": "Celinas-Cumcovered Slutty-Thong",
        "nature": "sexy",
        "id_token": "target character token"
      },
      "enchantments": [],
      "attributes": 0,
      "variant_color": "Lime",
      "variant_accessory": null,
      "inanimate_actions": []
    }
  },
  "owner": {
    "token": "owner token",
    "username": "owner username",
    "names": "owner character name",
    "status": {
      "body": 500,
      "maxBody": 500,
      "mind": 500,
      "maxMind": 500
    },
    "equipment": []
  },
  "location": {
    "character": {},
    "opponent": {}
  }
}
```

The important part is that `character.item.character.id_token` must match the
transformed character token. The client ignores item forms for other tokens.

## Login/reload requirement

On every login/reconnect, if the character is inanimate, include:

```json
{
  "character": {
    "item": "<persisted item form>"
  },
  "owner": "<persisted owner character>"
}
```

or include equivalent fields in the initial character/location payload before
`processData()` finishes. Without this, reload always returns the character to
normal because the browser has no durable source of truth.

## Minimal pseudo-code

```js
async function handleDevSetInanimate(session, msg) {
  requireDeveloper(session);

  const target = await db.characters.findByToken(msg.targetToken);
  const owner = await db.characters.findByToken(msg.ownerToken);
  const base = await db.itemBases.findById(msg.baseId);
  if (!target || !owner || !base) return { success: false, message: "not found" };

  const item = await db.items.create({
    owner_token: owner.token,
    base_id: base.id,
    stack: 0,
    flags: 0,
    attributes: 0,
    variant_color: msg.color || null,
    variant_accessory: msg.variantAccessory || null,
    character: {
      permanent: Boolean(msg.permanent),
      sealed: Boolean(msg.sealed),
      name: msg.itemName || `${target.names}'s form`,
      nature: target.nature,
      id_token: target.token
    }
  });

  await db.characters.update(target.token, {
    inanimate_item_id: item.id,
    owner_token: owner.token
  });

  await db.equipment.add(owner.token, item.id);
  await db.countdowns.set(target.token, "recentlyTransformed", 900000);

  sendToCharacter(target.token, {
    character: { item: serializeItem(item) },
    owner: serializeCharacter(owner)
  });

  sendToCharacter(target.token, [target.token, { countdowns: ["recentlyTransformed", 900000] }]);
  sendToCharacter(session.characterToken, { success: true, itemId: item.id, callbackId: msg.id });
}
```

Adjust table/field names to the real server. The contract is the key part:
persist `character.item`, persist `owner`, and send the supported update shape.
