(() => {
	let _readyResolve;

	const C = {};
	const GUID = {};

	IMAGE_PROCESSING = {
		loadOpenCV: async (sources, wasm) => {
			if (Object.isFrozen(C) || LOCK.IsLocked(C)) {
				return true;
			}
			await LOCK.Lock(C);
			try {
				await Promise.all(sources.map(source => new Promise(resolve => createScript(source).onload = resolve)));
				await new Promise(resolve => createScript(wasm).onload = resolve);
				Object.freeze(Object.assign(C, await ModuleCG()));
			}
			catch { }
			finally {
				LOCK.Unlock(C);
			}
			_readyResolve(true);
			return true;
		},
		loadGUIDFactory: async (wasm) => {
			if (Object.isFrozen(GUID) || LOCK.IsLocked(GUID)) {
				return true;
			}
			await LOCK.Lock(GUID);
			try {
				await new Promise(resolve => createScript(wasm).onload = resolve);
				Object.freeze(Object.assign(GUID, await ModuleGUID()));
			}
			catch { }
			finally {
				LOCK.Unlock(GUID);
			}
			_readyResolve(true);
			return true;
		},
		createImageData: (width, height) => {
			const canvas = document.createElement("canvas");
			const context = canvas.getContext('2d');
			return context.createImageData(width, height);
		},
		getGUID: () => GUID.createGUID(),
		getWornItemImage: (item, tier = 0, sprite = null, size = 0, scale = 0, pixelated = false) => formatMediaURL(sprite || item.base.worn_image_url || item.base.image_url, pixelated ? 16 : powCeil(size * (scale || getMediaScale())), item.base.color_variants && item.variant_color && Math.max(GAME_MANAGER.instance.tier, tier, item.base.default_color ? 2 : item.character && item.character.tier ? item.character.tier : 0) >= 2 && nameToRef(item.variant_color)),
		getItemImage: (item, tier = 0, size = 0, scale = 0, pixelated = false) => formatMediaURL(item.base.image_url, pixelated ? 16 : powCeil(size * (scale || getMediaScale())), item.base.color_variants && item.variant_color && Math.max(GAME_MANAGER.instance.tier, tier, item.base.default_color ? 2 : item.character && item.character.tier ? item.character.tier : 0) >= 2 && nameToRef(item.variant_color)),
		getMorphImage: (imageUrl, color, tier = 0, size = 0, scale = 0, pixelated = false) => formatMediaURL(imageUrl, pixelated ? 16 : powCeil(size * (scale || getMediaScale())), color && Math.max(GAME_MANAGER.instance.tier, tier) >= 2 && nameToRef(color)),
	};

	Object.defineProperty(IMAGE_PROCESSING, 'ready', { value: new Promise(resolve => _readyResolve = resolve), writable: false });

	const MIN_PIXELS_PER_DIVISION = 20;

	function getImageData(source, boundingBox, scale, flipped) {
		const canvas = document.createElement("canvas");
		const context = canvas.getContext('2d');
		canvas.width = source.width * scale;
		canvas.height = source.height * scale;
		if (flipped) {
			context.translate(canvas.width, 0);
			context.scale(-1, 1);
		}
		context.drawImage(source, 0, 0, canvas.width, canvas.height);
		return context.getImageData(boundingBox[0], boundingBox[1], boundingBox[2], boundingBox[3]);
	}

	function findOffsetRect(width, height, points) {
		const topLeft = [Number.MAX_VALUE, Number.MAX_VALUE];
		const bottomRight = [Number.MIN_VALUE, Number.MIN_VALUE];

		for (let i = 0; i < points.length; i++) {
			topLeft[0] = Math.min(topLeft[0], points[i][0]);
			topLeft[1] = Math.min(topLeft[1], points[i][1]);
			bottomRight[0] = Math.max(bottomRight[0], points[i][0]);
			bottomRight[1] = Math.max(bottomRight[1], points[i][1]);
		}

		bottomRight[0] = Math.min(width - bottomRight[0], 0);

		topLeft[0] = Math.min(topLeft[0], 0);
		topLeft[1] = Math.min(topLeft[1] + height - (bottomRight[1] - topLeft[1]), 0);

		return [[topLeft[0], topLeft[1]], [bottomRight[0], bottomRight[1]]];
	}

	function pointsToVector(points) {
		const vector = new C.Point2fVector();
		for (let i = 0; i < points.length; i++) {
			vector.push_back(points[i]);
		}
		return vector;
	}

	function rectsToVector(rects) {
		const vector = new C.Point2fVector();
		for (let i = 0; i < rects.length; i++) {
			vector.push_back(rects[i]);
		}
		return vector;
	}

	function imageToVector(image) {
		const vector = new C.Color32Vector();
		const size = image.width * image.height * 4;
		for (let i = 0; i < size; i += 4) {
			vector.push_back([image.data[i + 0], image.data[i + 1], image.data[i + 2], image.data[i + 3]]);
		}
		return vector;
	}

	function morph(points) {
		for (let i = 0; i < points.length; i++) {
			this.points.set(i, points[i]);
		}
		this.affineDeformation.MorphRects(this.pointsOrigin, this.points, this.rectsOrigin, this.rects);
		return this.rects;
	}

	function prepareSource(source) {
		const scale = source.scale || 1;
		source = Object.assign({}, source);
		if (scale != 1) {
			source.boundingBox = source.boundingBox.map(point => Math.floor(point * scale));
			source.centerOfMass = source.centerOfMass.map(point => Math.floor(point * scale));
			source.points = source.points.map(coords => [Math.floor(coords[0] * scale), Math.floor(coords[1] * scale)]);
		}
		else {
			source.boundingBox = source.boundingBox.slice();
			source.centerOfMass = source.centerOfMass.slice();
			source.points = source.points.map(coords => coords.slice());
		}
		return source;
	}

	IMAGE_PROCESSING.Interpolator = function Interpolator(sourceA, sourceB, offset) {
		return flubber.interpolate(
			PointVector.subtract(sourceA.points.slice().map(p => [p[0], p[1]]), sourceA.boundingBox[0] - offset[0], sourceA.boundingBox[1] - offset[1]),
			PointVector.subtract(sourceB.points.slice().map(p => [p[0], p[1]]), sourceB.boundingBox[0] - offset[2], sourceB.boundingBox[1] - offset[3]),
			{ string: false, maxSegmentLength: 0 }
		);
	}

	IMAGE_PROCESSING.Animator = function Animator(_sourceA, _sourceB, _range) {
		let a_source;
		let a_points;
		let a_rects_out;
		let a_affine_deformation

		let b_source;
		let b_points;
		let b_rects_out;
		let b_affine_deformation;

		let rects_origin;
		let points_in;
		let bilinear_interpolation;

		_sourceA = prepareSource(_sourceA);
		_sourceB = prepareSource(_sourceB);

		const _offset = [0, 0, Math.max(0, _sourceA.centerOfMass[0] - _sourceB.centerOfMass[0]), Math.max(0, _sourceA.centerOfMass[1] - _sourceB.centerOfMass[1])];

		let interpolator = new IMAGE_PROCESSING.Interpolator(_sourceA, _sourceB, _offset);

		const [_topLeft, _bottomRight] = _range ? findOffsetRect(_sourceA.boundingBox[2], _sourceA.boundingBox[3], interpolator(_range[0])) : [[0, 0], [0, 0]];

		_offset[0] -= _topLeft[0];
		_offset[1] -= _topLeft[1];
		_offset[2] -= _topLeft[0];
		_offset[3] -= _topLeft[1];

		if (_sourceB.relativeOffset) {
			_offset[2] += _sourceB.relativeOffset[0] ? _sourceB.relativeOffset[0] * (_sourceB.relativeOffset[0].scale || 1) : 0;
			_offset[3] += _sourceB.relativeOffset[1] ? _sourceB.relativeOffset[1] * (_sourceB.relativeOffset[1].scale || 1) : 0;
		}

		_sourceA.boundingBox[2] -= _topLeft[0] + _bottomRight[0];
		_sourceA.boundingBox[3] -= _topLeft[1];

		interpolator = new IMAGE_PROCESSING.Interpolator(_sourceA, _sourceB, _offset);

		_sourceA = Object.assign({}, _sourceA, { points: interpolator(0), image: getImageData(_sourceA.source, _sourceA.boundingBox, _sourceA.scale || 1, _sourceA.flipped) });
		_sourceB = Object.assign({}, _sourceB, { points: interpolator(1), image: getImageData(_sourceB.source, _sourceB.boundingBox, _sourceB.scale || 1, _sourceB.flipped) });

		const _canvasWidth = Math.max(_sourceA.image.width, _sourceB.image.width);
		const _canvasHeight = Math.max(_sourceA.image.height, _sourceB.image.height);

		const _canvas = document.createElement("canvas");
		const _context = _canvas.getContext("2d", { willReadFrequently: true });

		_canvas.width = _canvasWidth;
		_canvas.height = _canvasHeight;

		const _gridSize = [Math.floor(_canvasWidth / MIN_PIXELS_PER_DIVISION), Math.floor(_canvasHeight / MIN_PIXELS_PER_DIVISION)];
		const _rectSize = [_canvasWidth / _gridSize[0], _canvasHeight / _gridSize[1]];
		const _rects = [];
		const _contextMap = new Map();

		for (let j = 0; j <= _gridSize[1]; j++) {
			let y = Math.round(j * _rectSize[1]);
			for (let i = 0; i <= _gridSize[0]; i++) {
				let x = Math.round(i * _rectSize[0]);
				_rects.push([x, y]);
			}
		}

		this.Delete = () => {
			_contextMap.clear();

			a_source && a_source.delete();
			a_points && a_points.delete();
			a_rects_out && a_rects_out.delete();
			a_affine_deformation && a_affine_deformation.delete();

			b_source && b_source.delete();
			b_points && b_points.delete();
			b_rects_out && b_rects_out.delete();
			b_affine_deformation && b_affine_deformation.delete();

			rects_origin && rects_origin.delete();
			points_in && points_in.delete();
			bilinear_interpolation && bilinear_interpolation.delete();
		};

		try {
			a_points = pointsToVector(_sourceA.points);
			b_points = pointsToVector(_sourceB.points);

			points_in = rectsToVector(_sourceA.points);
			rects_origin = rectsToVector(_rects);

			a_rects_out = rectsToVector(_rects);
			b_rects_out = rectsToVector(_rects);

			b_affine_deformation = new C.AffineDeformation(b_points.size());
			a_affine_deformation = new C.AffineDeformation(a_points.size());

			Object.assign(_sourceA, { morph: morph, pointsOrigin: a_points, points: points_in, rectsOrigin: rects_origin, rects: a_rects_out, affineDeformation: a_affine_deformation });
			Object.assign(_sourceB, { morph: morph, pointsOrigin: b_points, points: points_in, rectsOrigin: rects_origin, rects: b_rects_out, affineDeformation: b_affine_deformation });

			bilinear_interpolation = new C.BilinearInterpolation(_canvasWidth, _canvasHeight, _gridSize[0], _gridSize[1], _rectSize[0], _rectSize[1]);

			bilinear_interpolation.SetOffset(_offset[0], _offset[1], _offset[2], _offset[3]);
			bilinear_interpolation.SetBoundingBoxes(
				_sourceA.boundingBox[0], _sourceA.boundingBox[1], Math.floor(_sourceA.boundingBox[2]), Math.floor(_sourceA.boundingBox[3]),
				_sourceB.boundingBox[0], _sourceB.boundingBox[1], Math.floor(_sourceB.boundingBox[2]), Math.floor(_sourceB.boundingBox[3])
			);

			a_source = imageToVector(_sourceA.image);
			b_source = imageToVector(_sourceB.image);
		}
		catch (e) {
			this.Delete();
			throw e;
		}

		let _drawTriangles = false;
		let _applyMask = false;
		let _antialiasing = false;
		let _drawLines = false;

		Object.defineProperties(this, {
			'drawTriangles': {
				get: () => _drawTriangles,
				set: (drawTriangles) => _drawTriangles = drawTriangles == true,
			},
			'drawLines': {
				get: () => _drawLines,
				set: drawLines => _drawLines = drawLines == true,
			},
			'applyMask': {
				get: () => _applyMask,
				set: applyMask => _applyMask = applyMask == true,
			},
			'antialiasing': {
				get: () => _antialiasing,
				set: antialiasing => _antialiasing = antialiasing == true,
			},
		});

		const getContext = (canvas) => {
			let ctx = _contextMap.get(canvas);
			!ctx && _contextMap.set(canvas, ctx = canvas.getContext("2d"));
			return ctx;
		}

		this.DrawFrame = (progress, canvas, width, height, scale) => {
			const ctx = getContext(canvas);

			renderFrame(interpolator(progress), progress);

			const ratio = height / _sourceA.source.height;

			scale = scale || 1;
			height = Math.round(_sourceA.boundingBox[3] * ratio * scale);
			width = Math.round(_sourceA.boundingBox[3] * ratio / height * width * scale);

			canvas.width != width && (canvas.width = width);
			canvas.height != height && (canvas.height = height);
			canvas.style.height = `${_sourceA.boundingBox[3] * ratio}px`;

			ctx.reset();
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			if (_drawLines) {
				ctx.rect(0, 0, canvas.width, canvas.height);

				ctx.rect(0, canvas.height - _sourceA.boundingBox[3] * ratio, canvas.width, - _topLeft[1] * ratio);

				ctx.rect(
					(canvas.width - (_sourceA.source.width - (_sourceA.source.width - _sourceA.boundingBox[2]) + _topLeft[0] + _bottomRight[0]) * ratio) / 2,
					0,
					(_sourceA.boundingBox[2] + _topLeft[0] + _bottomRight[0]) * ratio,
					canvas.height,
				);

				ctx.rect(
					(canvas.width - (_sourceA.source.width - (_sourceA.source.width - _sourceA.boundingBox[2]) + _topLeft[0] + _bottomRight[0]) * ratio) / 2 + _topLeft[0] * ratio,
					0,
					_sourceA.boundingBox[2] * ratio,
					canvas.height,
				);

				ctx.stroke();
			}

			ctx.translate(-1, -1);
			ctx.drawImage(_canvas, (canvas.width - (_sourceA.source.width - (_sourceA.source.width - _sourceA.boundingBox[2]) + _topLeft[0] + _bottomRight[0]) * ratio) / 2 + _topLeft[0] * ratio, 0, _sourceA.boundingBox[2] * ratio, canvas.height);
		}

		const renderFrame = async (points, progress) => {
			const imageData = _antialiasing
				? new ImageData(new Uint8ClampedArray(C.HEAP8.buffer, bilinear_interpolation.DrawRectsAntialiasing(a_source, b_source, _sourceA.morph(points), _sourceB.morph(points), rects_origin, clamp01(progress)), _sourceA.image.width * _sourceA.image.height * 4), _sourceA.image.width, _sourceA.image.height)
				: new ImageData(new Uint8ClampedArray(C.HEAP8.buffer, bilinear_interpolation.DrawRects(a_source, b_source, _sourceA.morph(points), _sourceB.morph(points), rects_origin, clamp01(progress)), _sourceA.image.width * _sourceA.image.height * 4), _sourceA.image.width, _sourceA.image.height);

			_context.putImageData(imageData, 0, 0);
			_context.beginPath();
			{
				_context.moveTo(points[points.length - 1][0], points[points.length - 1][1]);
				for (let i = 0; i < points.length; i++) {
					_context.lineTo(points[i][0], points[i][1]);
				}
			}
			_context.closePath();

			if (_applyMask && progress > 0 && progress < 1) {
				_context.globalCompositeOperation = "destination-in";
				_context.fill();
			}

			if (_drawTriangles) {
				const triangles = Delaunator.from(points).triangles;

				for (let i = 0; i < triangles.length; i += 3) {
					const p1 = [points[triangles[i + 0]][0], points[triangles[i + 0]][1]];
					const p2 = [points[triangles[i + 1]][0], points[triangles[i + 1]][1]];
					const p3 = [points[triangles[i + 2]][0], points[triangles[i + 2]][1]];
					_context.moveTo(p3[0], p3[1]);
					_context.lineTo(p1[0], p1[1]);
					_context.lineTo(p2[0], p2[1]);
					_context.lineTo(p3[0], p3[1]);
				}

				_context.globalCompositeOperation = "source-over";
				_context.stroke();
			}
		}
	};

	IMAGE_PROCESSING.findPoints = (image, out = null, drawContour = false, drawTriangles = false, drawConvexHull = false, drawCenterOfMass = false) => {
		let src, dst, low, high, blob, poly, poly_mat, hull, hull_mat, contours, hierarchy;

		try {
			src = cv.imread(image);
		}
		catch {
			return null;
		}

		try {
			const obj = { source: image, scale: 1, flipped: false };
			contours = new cv.MatVector();
			hierarchy = new cv.Mat();
			{
				blob = new cv.Mat();
				low = new cv.Mat(src.rows, src.cols, src.type(), [0, 0, 0, 0]);
				high = new cv.Mat(src.rows, src.cols, src.type(), [150, 150, 150, 150]);
				cv.inRange(src, low, high, blob);
				cv.bitwise_not(blob, blob);
				cv.findContours(blob, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
			}

			let cnt, cntIndex;
			{
				let maxArea = 0;
				for (let i = 0; i < contours.size(); ++i) {
					const area = cv.contourArea(contours.get(i), false);
					if (area > maxArea) {
						maxArea = area;
						cntIndex = i;
					}
				}
				cnt = contours.get(cntIndex);
			}

			const points = [];

			let delaunay, tmp, epsilon = cv.arcLength(cnt, true) / cnt.rows;

			do {
				poly && poly.delete();
				poly_mat && poly_mat.delete();
				hull && hull.delete();
				hull_mat && hull_mat.delete();

				tmp = cnt;
				points.length = 0;

				poly = new cv.MatVector();
				{
					poly_mat = new cv.Mat();
					cv.approxPolyDP(tmp, poly_mat, epsilon, true);
					poly.push_back(poly_mat);
					tmp = poly_mat;
				}

				hull = new cv.MatVector();
				{
					hull_mat = new cv.Mat();
					cv.convexHull(tmp, hull_mat, false, true);
					hull.push_back(hull_mat);
					const boundingBox = cv.boundingRect(tmp);
					obj.boundingBox = [boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height];
				}

				for (let row = 0; row < tmp.rows; row++) {
					points.push([tmp.data32S[row * 2], tmp.data32S[row * 2 + 1]]);
				}
				for (let row = 0; row < tmp.rows; row++) {
					points.push([tmp.data32S[row * 2], tmp.data32S[row * 2 + 1]]);
				}

				delaunay = Delaunator.from(points)
				if (delaunay.triangles.length == 0) {
					if (epsilon == 1) {
						break;
					}
					epsilon = 1;
				}
			}
			while (!delaunay || delaunay.triangles.length == 0);

			cnt = tmp;

			const centerOfMass = [0, 0];
			const triangles = [];

			if (delaunay.triangles.length > 0) {
				let totalWeight = 0;

				for (let i = 0; i < delaunay.triangles.length; i += 3) {
					const triangle = [points[delaunay.triangles[i + 0]], points[delaunay.triangles[i + 1]], points[delaunay.triangles[i + 2]]];
					const point = Triangle.centroid(triangle[0], triangle[1], triangle[2]);

					if (cv.pointPolygonTest(cnt, new cv.Point(point[0], point[1]), false) < 0) {
						continue;
					}

					const weight = Triangle.area(triangle[0], triangle[1], triangle[2]);
					centerOfMass[0] += point[0] * weight;
					centerOfMass[1] += point[1] * weight;
					totalWeight += weight;
					triangles.push(triangle[0], triangle[1], triangle[2],);
				}

				if (totalWeight != 0) {
					centerOfMass[0] = Math.floor(centerOfMass[0] / totalWeight);
					centerOfMass[1] = Math.floor(centerOfMass[1] / totalWeight);
				}
			}
			else {
				centerOfMass[0] = Math.floor(obj.boundingBox[0] + obj.boundingBox[0] / 2);
				centerOfMass[1] = Math.floor(obj.boundingBox[1] + obj.boundingBox[3] / 2);
			}

			if (out) {
				dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);

				if (drawTriangles) {
					let color = new cv.Scalar(Math.round(Math.random() * 255 * 0.5), Math.round(Math.random() * 255 * 0.5), Math.round(Math.random() * 255 * 0.5));

					for (let i = 0; i < delaunay.triangles.length; i += 3) {
						const p1 = new cv.Point(points[delaunay.triangles[i + 0]][0], points[delaunay.triangles[i + 0]][1]);
						const p2 = new cv.Point(points[delaunay.triangles[i + 1]][0], points[delaunay.triangles[i + 1]][1]);
						const p3 = new cv.Point(points[delaunay.triangles[i + 2]][0], points[delaunay.triangles[i + 2]][1]);
						cv.line(dst, p1, p2, color, 1);
						cv.line(dst, p2, p3, color, 1);
						cv.line(dst, p3, p1, color, 1);
					}

					color = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255));
					for (let i = 0; i < cnt.rows; i++) {
						cv.circle(dst, new cv.Point(points[i][0], points[i][1]), 1, color, 1, cv.LINE_8, 0);
					}
				}

				if (drawContour) {
					const color = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255));
					cv.drawContours(dst, poly, 0, color, 1, cv.LINE_8, hierarchy, 0);
				}

				if (drawConvexHull) {
					const color = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255));
					cv.drawContours(dst, hull, 0, color, 1, cv.LINE_8, hierarchy, 0);
				}

				if (drawCenterOfMass) {
					const color = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255));
					cv.circle(dst, new cv.Point(centerOfMass[0], centerOfMass[1]), 4, color, 2, cv.LINE_8, 0);

					for (let i = 0; i < triangles.length; i += 3) {
						const point = Triangle.centroid(triangles[i + 0], triangles[i + 1], triangles[i + 2]);
						cv.circle(dst, new cv.Point(point[0], point[1]), 1, color, 1, cv.LINE_8, 0);
					}
				}

				cv.imshow(out, dst);
			}

			return Object.assign(obj, { points: points, centerOfMass: [centerOfMass[0] - obj.boundingBox[0], centerOfMass[1] - obj.boundingBox[1]] });
		}
		finally {
			src && src.delete();
			dst && dst.delete();
			low && low.delete();
			high && high.delete();
			blob && blob.delete();
			poly && poly.delete();
			poly_mat && poly_mat.delete();
			hull && hull.delete();
			hull_mat && hull_mat.delete();
			contours && contours.delete();
			hierarchy && hierarchy.delete();
		}
	}

	const Triangle = {
		centroid: (a, b, c) => [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3],
		area: (a, b, c) => {
			const m = [Math.min(a[0], b[0], c[0]), Math.min(a[1], b[1], c[1]), Math.max(a[0], b[0], c[0]), Math.max(a[1], b[1], c[1])];
			return (m[2] - m[0]) * (m[3] - m[1]) / 2;
		},
	};

	const PointVector = {
		subtract: (v, x, y) => {
			for (let i = 0; i < v.length; i++) {
				v[i][0] -= x; v[i][1] -= y;
			}
			return v;
		},
		multiply: (v, w) => {
			for (let i = 0; i < v.length; i++) {
				v[i][0] *= w; v[i][1] *= w;
			}
			return v;
		}
	};

	function createScript(source) {
		const script = document.createElement("script");
		script.type = "text/javascript";
		script.src = source;
		script.async = true;
		document.getElementsByTagName("head")[0].appendChild(script);
		return script;
	}

	window.createScript = createScript;
})();
