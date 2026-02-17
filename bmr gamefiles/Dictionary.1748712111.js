{
    DICTIONARY = {}

    const _dictionary = {};

    let _readyResolve;

    DICTIONARY.ready = new Promise(resolve => _readyResolve = resolve);

    DICTIONARY.Load = async (...paths) => {
        try {
            const results = await Promise.all(paths.map(path => fetch(path)));
            await Promise.all(results.map(async result => result.ok && Object.assign(_dictionary, await result.json())));
        }
        finally {
            _readyResolve(true);
        }
        return true;
    }

    getString = (key) => {
        return _dictionary[key] || key;
    }

    getText = (key, ...inserts) => {
        const str = _dictionary[key] || key;
        return str && str.replace(/\{[0-9]+\}/g, match => inserts[parseInt(match.substr(1, 1))]).replace(/s's/g, "s'");
    }
}
