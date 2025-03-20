import { items } from '../classes/Items.js';
const BASE_URL = '../client/assets/json/';

class Resources {
  constructor() {
    this.mapJsonToLoad = { 
      genus01: 'maps/map_genus_01.json',
      // genus02: 'maps/map_genus_02.json',
      // genus03: 'maps/map_genus_03.json'
    };
    this.mapData = {};
    this.playerData = {};
    this.itemData = {};

    this.loadData();
  }

  async fetchJson(url) {
    const response = await fetch(`${BASE_URL}${url}`);
    if (!response.ok) {
      throw new Error(`Fetch error for ${url}: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async loadData() {
    try {
      await Promise.all([
        this.loadMapData(),
        this.loadPlayerData(),
        this.loadItemData(),
      ]);
      console.log('All data loaded successfully.');
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  async loadMapData() {
    if (Object.keys(this.mapJsonToLoad).length === 0) return;

    const mapPromises = Object.entries(this.mapJsonToLoad).map(async ([key, path]) => {
      this.mapData[key] = await this.fetchJson(path);
    });

    await Promise.all(mapPromises);
    this.mapData.isLoaded = true;
  }

  async loadPlayerData() {
    const data = await this.fetchJson('player.json');
    this.playerData = data;
    this.playerData.isLoaded = true;
  }

  async loadItemData() {
    const data = await this.fetchJson('items.json');
    this.itemData = data;
    this.itemData.isLoaded = true;

    console.log('Initializing items...');
    items.initAllItems();
  }
}

export const resources = new Resources();