import * as PIXI from 'pixi.js';
import { random } from '../utils';

export class Node {
  children: Node[] = [];
  x: number = random(300, 600);
  y: number = random(300, 600);
  
  constructor(
    public name: number,
    public critical: boolean = false,
    public level: number = 0
  ) { }
}