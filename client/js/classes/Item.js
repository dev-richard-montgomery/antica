export class Item {
  constructor( name, id, worldPosition, drawPosition ) {
    this.image = new Image();
    this.image.src = './backend/assets/item_data/item-assets.png';
    this.name = name;
    this.id = id;
    this.worldPosition = worldPosition;
    this.drawPosition = drawPosition || { x: null, y: null };
    this.hover = false;
    this.held = false;
  };

  loadImage() {
    return new Promise((resolve, reject) => {
      this.image.onload = () => resolve(this.image);
      this.image.onerror = () => reject(new Error('Failed to load area image.'));
    });
  };
};