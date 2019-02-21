import { Node } from './Node';
import * as d3 from 'd3';
import { GraphStore } from '../store/GraphStore';
import { intercept, Lambda } from 'mobx';

interface Point {
  x: number;
  y: number;
}

export class Graph {
  private links: any[];
  private radius = 10;
  private offset = {
    x: 0,
    y: 0
  };
  private width: number;
  private height: number;
  private criticalRatio = 1.33;
  private context: CanvasRenderingContext2D;
  private disposer: Lambda;
  private linkColor = '#566270';
  private nodeColor = '#539393';
  private criticalNodeColor = '#e76244';
  private simulation: d3.Simulation<any, any>;
  private canvas: d3.Selection<HTMLCanvasElement, any, any, any>;

  constructor(private target: HTMLDivElement, private store: GraphStore) {
    this.canvas = d3.select(this.target).append('canvas');

    window.addEventListener('resize', this.updateSizes);
    this.updateSizes();

    this.drawNodes();
    this.updatePhisics();

    this.disposer = intercept(this.store, 'root', (changes) => {
      this.updatePhisics();
      return changes;
    });
    this.addUserActions();
  }

  private addUserActions() {
    let mousePressed = false;
    let wasHovered = false;
    let lastHovered: Node;
    let prevX: number;
    let prevY: number;

    const mouseDown = (event: MouseEvent) => {
      mousePressed = true;
      wasHovered = false;
      lastHovered = null;
      prevX = event.clientX;
      prevY = event.clientY;
    };    

    const mouseMove = (event: MouseEvent) => {
      this.store.popup.active = false;
      const rect = this.target.getBoundingClientRect();
      const hoveredNode = this.getHoveredTarget(event.clientX - rect.left, event.clientY - rect.top) || lastHovered;
      if (mousePressed) {
        const diffX = prevX - event.clientX;
        const diffY = prevY - event.clientY;
        if (hoveredNode || wasHovered) {
          lastHovered = hoveredNode;
          hoveredNode.x -= diffX;
          hoveredNode.y -= diffY;

          wasHovered = true;
        } else if (!wasHovered) {
          this.offset.x -= diffX;
          this.offset.y -= diffY;
        }

        prevX = event.clientX;
        prevY = event.clientY;
        this.target.classList.add('grabbed');
        this.tick();
      } else if (hoveredNode) {
        this.store.popup = {
          active: true,
          position: {
            x: event.clientX,
            y: event.clientY
          },
          info: this.getInfo(hoveredNode)
        };
      }
    };

    const mouseOut = () => {
      mousePressed = false;
      this.target.classList.remove('grabbed');
      this.store.popup.active = false;
    };

    this.target.addEventListener('mousedown', mouseDown);
    this.target.addEventListener('mousemove', mouseMove);
    this.target.addEventListener('mouseup', mouseOut);
    this.target.addEventListener('mouseout', mouseOut);
  }
  private updatePhisics() {
    this.links = this.store.links;
    this.simulation.nodes(this.store.nodes);
    var linkForce = d3.forceLink(this.links).id((d: any) => d.name);

    this.simulation.force('links', linkForce);
    this.simulation.alpha(1).restart();
  }

  private getInfo(node: Node) {
    return {
      name: node.name,
      critical: node.critical,
      level: node.level
    };
  }

  private getHoveredTarget(x: number, y: number) {
    const precision = 5;
    return this.store.nodes.find((node: any) => {
      return x > node.x + this.offset.x - this.radius - precision && x < node.x + this.offset.x + this.radius + precision &&
        y > node.y + this.offset.y - this.radius - precision && y < node.y + this.offset.y + this.radius + precision;
    })
  }

  public updateSizes = () => {
    this.width = this.target.offsetWidth,
      this.height = this.target.offsetHeight;
    this.canvas
      .attr('width', this.width)
      .attr('height', this.height);
  }

  private drawNodes() {
    this.context = this.canvas.node().getContext('2d');
    this.simulation = d3.forceSimulation();

    this.simulation
      .force('charge_force', d3.forceManyBody())
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .on('tick', this.tick);
  }

  private rotate({ cx, cy }: { cx: number, cy: number }, { x, y }: Point, angle: number) {
    var radians = (Math.PI / 180) * angle,
      cos = Math.cos(radians),
      sin = Math.sin(radians),
      nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
      ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return { x: nx, y: ny };
  }

  private drawArrow(cx: number, cy: number, rotation: number) {
    const side = this.radius * 0.8;
    this.context.fillStyle = this.linkColor;
    this.context.beginPath();
    const point1 = this.rotate({ cx, cy }, { x: cx - side * 0.33, y: cy + side * 0.33 }, 136 - rotation);
    const point3 = this.rotate({ cx, cy }, { x: cx + side * 0.66, y: cy + side * 0.33 }, 136 - rotation);
    const point2 = this.rotate({ cx, cy }, { x: cx - side * 0.33, y: cy - side * 0.66 }, 136 - rotation);
    this.context.moveTo(point1.x, point1.y);
    this.context.lineTo(point2.x, point2.y);
    this.context.lineTo(point3.x, point3.y);
    this.context.fill();
  }

  private getRadius(node: Node) {
    return node.critical ? this.radius * this.criticalRatio : this.radius;
  }

  private getTriangleAngle(sourcePoint: Point, targetPoint: Point): number {
    return Math.atan2(targetPoint.y - sourcePoint.y, targetPoint.x - sourcePoint.x) * 180 / Math.PI;
  }

  private getDistance(sourcePoint: Point, targetPoint: Point): number {
    return Math.sqrt(Math.pow((sourcePoint.x - targetPoint.x), 2) + Math.pow((sourcePoint.y - targetPoint.y), 2));
  }
  private getOffsettedPoint(point: Point) {
    return {
      x: point.x + this.offset.x,
      y: point.y + this.offset.y
    }
  }
  private tick = () => {
    this.context.clearRect(0, 0, this.width, this.height);

    this.context.lineWidth = 2;
    this.context.strokeStyle = this.linkColor;

    this.links.forEach((d: any) => {
      const radius = this.getRadius(d.target);

      this.context.beginPath();
      const sourcePoint = this.getOffsettedPoint(d.source);
      const targetPoint = this.getOffsettedPoint(d.target)
      this.context.moveTo(sourcePoint.x, sourcePoint.y);
      this.context.lineTo(targetPoint.x, targetPoint.y);
      this.context.closePath();
      this.context.stroke();

      const len = this.getDistance(sourcePoint, targetPoint);
      const { x, y }: Point = this.getArrowPosition(sourcePoint, targetPoint, radius * 1.33 / len);
      this.drawArrow(x, y, this.getTriangleAngle(sourcePoint, targetPoint));
    });

    this.store.nodes.forEach((d: any) => {
      const color = d.critical ? this.criticalNodeColor : this.nodeColor;

      this.context.fillStyle = color;
      this.context.beginPath();
      this.context.moveTo(d.x + this.offset.x, d.y + this.offset.y);
      this.context.arc(d.x + this.offset.x, d.y + this.offset.y, this.getRadius(d), 0, 2 * Math.PI);
      this.context.fill();
    });

  }

  private getArrowPosition(source: Point, target: Point, ratio: number): Point {
    return {
      x: target.x + (source.x - target.x) * ratio,
      y: target.y + (source.y - target.y) * ratio
    };
  }

  public destroy() {
    this.disposer();
  }
}