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

		// NOTE Remove this block later on.
		this.app.view.style.transform = "scale(2)";
		this.app.view.style.position = "absolute";
		this.app.view.style.left     = "256px";
		this.app.view.style.top      = "256px";

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

			if (options.contain)  {
				let newContainer = new PIXI.Container();
				newContainer.sortableChildren = true;
				newContainer.addChild(newSprite);
				newSprite = newContainer;
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

	light(x, y, radius, blur, callback) {
		let circle = new PIXI.Graphics().beginFill(0xff0000).drawEllipse(radius + blur, (radius / 2) + blur, radius, radius / 2).endFill();
		circle.filters = [new PIXI.filters.BlurFilter(blur)];

		let bounds   = new PIXI.Rectangle(0, 0, (radius + blur) * 2, ((radius / 2) + blur) * 2);
		let texture  = this.app.renderer.generateTexture(circle, PIXI.SCALE_MODES.NEAREST, 1, bounds);
		let newLight = new PIXI.Sprite(texture);
		newLight.anchor.set(0.5);
		newLight.position.set(x, y);

		if (!this.layers.light) { // Create a new lighting layer, if not present.
			this.layers.light = new PIXI.Container();
			let topLeft = new PIXI.Sprite(this.app.renderer.generateTexture(new PIXI.Graphics().beginFill(0x000000).drawRect(0, 0, 256, 256).endFill()))
			this.layers.light.addChild(topLeft)
		}

		this.layers.light.addChild(newLight);
		this.app.stage.mask = new PIXI.Sprite(this.app.renderer.generateTexture(this.layers.light));
	}
}

class Map extends Renderer {
	constructor(appendTo) {
		super(appendTo, ["img/world/tile.png", "img/world/wall.png"]);

		this.loader.load((loader, resources) => { // NOTE Everything in here is temporary.
			for (let y = 0; y < 8; ++y) {
				for (let x = 0; x < 8; ++x) {
					this.tile(2, 0, x, y);
				}
			}

			this.wall(3, 0, 3, 4);
			this.wall(0, 0, 4, 4);
			this.wall(0, 0, 5, 4);
			this.light(128, 64, 28, 42);
		});
	}

	// Converts grid coordinates to screen coordinates.
	gridToScreen(gridX, gridY) { // (number, number)
		let startX = (7)   * 16;
		let x      = (gridX - gridY) * 16;
		let y      = (gridX + gridY) * 8;

		return {"x": x + startX, "y": y};
	}

	down(x, y) {
		
	}

	up(x, y) {
		
	}

	hover(x, y) {
		
	}

	unhover(x, y) {
		
	}

	tile(spriteX, spriteY, posX, posY) {
		let coords = this.gridToScreen(posX, posY);
		this.sprite("img/world/tile.png", {x1: spriteX * 32, y1: spriteY * 32, x2: 32, y2: 32, x: coords.x, y: coords.y, layer: "tile"}, sprite => {
			// Opt-in to interactivity.
			sprite.interactive = true;

			// Pointer events.
			sprite.on('pointerdown', () => this.down(posX, posY)).on('pointerup', () => this.down(posX, posY)).on('pointerover', () => this.hover(posX, posY)).on('pointerout', () => this.unhover(posX, posY));
		});
	}

	wall(spriteX, spriteY, posX, posY) {
		let coords = this.gridToScreen(posX, posY);
		this.sprite("img/world/wall.png", {x1: spriteX * 32, y1: spriteY * 64, x2: 32, y2: 64, x: coords.x, y: coords.y - 48, layer: "tile", contain: true}, sprite => {
			
		});
	}
}

const game = new Map(document.body);