export class MapArea {
  constructor() {
    this.image = new Image();
    this.image.src = '../assets/sprites/map-assets.png';
    this.frames = 20;
    this.pixels = 64;
    this.mapDimensions = { row: 200, col: 200 };
  };

  loadImage() {
    return new Promise((resolve, reject) => {
      this.image.onload = () => resolve(this.image);
      this.image.onerror = () => reject(new Error('Failed to load area image.'));
    });
  };
};