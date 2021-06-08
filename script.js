class Renderer {
	constructor(appendTo, loadList) {
		// PIXI Aliases.
		this.loader     = PIXI.Loader.shared;
		this.resources  = this.loader.resources;
		this.cache      = PIXI.utils.TextureCache;
		this.layers     = {};

		this.app = new PIXI.Application({
			width: 256,
			height: 256,
			antialias: false,
			transparent: false,
			resolution: 1
		});

		appendTo.appendChild(this.app.view);

		// Load the starting asset list.
		if (loadList) {
			this.loader.add(loadList);
		}
	}

	sprite(url, options, callback) {
		let createSprite = (texture) => {
			// Create the sprite.
			let newSprite = new PIXI.Sprite(new PIXI.Texture(texture));

			// Rectangular cropping.
			if (options && options.x2 && options.y2) {
				newSprite.texture.frame = new PIXI.Rectangle(options.x1 || 0, options.y1 || 0, options.x2, options.y2);
			}

			// Other options.
			if (options) {
				if (options.x)        {newSprite.x        = options.x};
				if (options.y)        {newSprite.y        = options.y};
				if (options.width)    {newSprite.width    = options.width};
				if (options.height)   {newSprite.height   = options.height};
				if (options.rotation) {newSprite.rotation = options.rotation};
				if (options.layer)    {
					if (!this.layers[options.layer]) { // Create a new layer.
						this.layers[options.layer] = new PIXI.Container();
						this.app.stage.addChild(this.layers[options.layer]);
					}

					// Add to layer.
					this.layers[options.layer].addChild(newSprite);
				};
			}

			return newSprite;
		}

		let texture = this.cache[url];
		if (!texture && this.resources[url]) {texture = this.resources[url].texture}

		if (texture) { // Use an available texture.
			let newSprite = createSprite(texture);
			if (callback) {callback(newSprite)};
			return newSprite;
		} else { // Load a new texture.
			this.loader.add(url).load(() => {
				texture = this.resources[url].texture;
				let newSprite = createSprite(texture);
				if (callback) {callback(newSprite)};
				return newSprite;
			});
		}
	}
}

class Map extends Renderer {
	constructor(appendTo) {
		super(appendTo, ["img/world/tile.png"]);

		this.loader.load((loader, resources) => {
			this.tile(96, 0, 0, 0);
			this.tile(96, 0, 1, 0);
			this.tile(128, 0, 2, 0);
			this.tile(128, 0, 3, 0);
			this.tile(64, 0, 4, 0);
			this.tile(64, 0, 5, 0);
			this.tile(96, 0, 6, 0);
			this.tile(64, 0, 7, 0);
		});
	}

	// Converts grid coordinates to screen coordinates.
	gridToScreen(gridX, gridY) { // (number, number)
		let startX = (4)   * 16;
		let x      = (gridX - gridY) * 16;
		let y      = (gridX + gridY) * 8;

		return {"x": x + startX, "y": y};
	}

	tile(spriteX, spriteY, posX, posY) {
		let coords = this.gridToScreen(posX, posY);
		this.sprite("img/world/tile.png", {x1: spriteX, y1: spriteY, x2: 32, y2: 32, x: coords.x, y: coords.y, layer: "tile"}, sprite => {
			sprite.interactable = true;
		});
	}
}

const game = new Map(document.body);