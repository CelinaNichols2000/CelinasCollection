(() => {
	LOCK = {};

	const locks = [];
	const batons = new Map();

	LOCK.Lock = async key => {
		const prevReleased = LOCK.WaitUntilReleased(key);
		const lock = { key };
		lock.released = new Promise(resolve => lock.unlock = resolve);
		locks.push(lock);
		return prevReleased;
	};

	LOCK.HasQueue = key => {
		return locks.filter(lock => lock.key === key).length > 1;
	};

	LOCK.IsLocked = key => {
		for (let i = 0; i < locks.length; i++) {
			if (locks[i].key === key) {
				return true;
			}
		}
		return false;
	};

	LOCK.Count = key => {
		let count = 0;
		for (let i = 0; i < locks.length; i++) {
			if (locks[i].key === key) {
				count++;
			}
		}
		return count;
	};

	LOCK.Unlock = key => {
		for (let i = 0; i < locks.length; i++) {
			if (locks[i].key === key) {
				locks[i].unlock();
				locks.splice(i, 1);
				break;
			}
		}
	};

	LOCK.WaitUntilReleased = async key => {
		for (let i = locks.length - 1; i >= 0; i--) {
			if (locks[i].key === key) {
				return locks[i].released;
			}
		}
		return null;
	};

	LOCK.GetBaton = key => {
		let id = batons.get(key) || 0;
		batons.set(key, ++id);
		return id;
	};

	LOCK.GetFirstBaton = key => {
		if (batons.has(key)) {
			return false;
		}
		const id = 1;
		batons.set(key, id);
		return id;
	};

	LOCK.RemoveBaton = key => batons.delete(key);

	LOCK.HasBaton = (key, id) => id !== undefined && batons.get(key) === id;

	LOCK.BatonExists = key => batons.has(key);
})();
