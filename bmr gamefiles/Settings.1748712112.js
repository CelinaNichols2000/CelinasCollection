(() => {
    const LOCAL_STORAGE_KEY = 'SETTINGS.data';
    let _data;

    loadData();

    SETTINGS = {};

    SETTINGS.Get = (key, defaultValue) => _data[key] !== undefined ? _data[key] : defaultValue;

    SETTINGS.Set = (key, value) => saveData(Object.assign(loadData(), { [key]: value }));

    SETTINGS.SetMany = data => saveData(Object.assign(loadData(), data));

    SETTINGS.Remove = key => {
        loadData();
        if (_data[key] !== undefined) {
            delete _data[key];
            saveData(_data);
        }
    };

    SETTINGS.Reset = () => {
        _data = {};
        window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    };

    function saveData(obj) {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(obj));
    }

    function loadData() {
        try {
            return _data = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY) || "{}");
        }
        catch (e) {
            return _data = {};
        }
    }
})();
