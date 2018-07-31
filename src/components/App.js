import React, { Component } from "react";
import "../styles/app.css";
import styled from "styled-components";

const hues = 6 + 8 * 4;

const Palette = styled.div`
  position: fixed;
  bottom: 0;
  opacity: 1;
  max-height: 100px;
  height: auto;
  width: 100%;
  background-color: lightgray;
  transition: all 0.25s ease;
  transform: translate(-90%, 90%);
  overflow: hidden;
  &:hover {
    transform: none;
    background-color: darkgray;
    opacity: 1;
    height: auto;
    max-height: 1000px;
  }
`;

const Canvas = styled.div`
  background-color: silver;
  width: auto;
  hight: auto;
`;

const Menu = styled.div`
  display: flex;
  position: fixed;
  flex-direction: column;
  left: -9rem;
  top: 0;
  opacity: 0.5;
  height: auto;
  width: 10rem;
  transition: all 0.25s ease-in-out;
  overflow: hidden;
  background-color: darkgrey;
  padding: 1px;
  &:hover {
    left: 0;
    opacity: 0.8;
  }
`;

const MenuButton = styled.button`
  width: 80%;
  justify-content: center;
  height: 1.5rem;
  overflow: hidden;
  color: grey;
  border-radius: 5px;
  padding: 0.2rem;
  opacity: 0;
  transition: all 0.25s ease;
  &:hover {
    color: black;
  }
  ${Menu}:hover & {
    opacity: 1;
  }
`;

const BrushMenu = styled.div`
  display: block;
  position: fixed;
  top: 0;
  right: 0;
  opacity: 0.5;
  height: 100%;
  width: 100px;
  transform: translate(90px);
  transition: all 0.25s ease-in-out;
  overflow: hidden;
  background-color: darkgrey;
  padding: 1px;
  &:hover {
    transform: none;
    opacity: 0.8;
  }
`;

const Brush = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  border: ${props => (!props.active ? "1px solid black" : "1px solid white")};
  background-color: ${props => (!props.active ? "transparent" : "black")}
  color: ${props => (!props.active ? "black" : "white")}
  margin: 10px auto;
  transition: all 0.25s ease-in-out;
  &:hover {
    color: white;
    background-color: black;
  }
`;

class App extends Component {
  draw = false;
  drawType = "circle";
  spraySize = 5;
  brushes = [2, 4, 8, 16];
  state = { drawColor: "hsl(255,0%,0%)", showMenu: true, activeBrush: 0 };
  lastPosition = { x: null, y: null };

  constructor() {
    super();
    this.palette = ["hsl(255,0%,0%)", "hsl(255,100%,100%)"];
    for (let h = 0; h < hues; ++h) {
      const color = `hsl(${h * (256 / hues)},${80}%,${55}%)`;
      this.palette.push(color);
    }
  }

  sprayPaint = () => {
    const { ctx } = this;
    const { x, y } = this.pos;

    switch (this.drawType) {
      case "circle":
        const circle = new Path2D();
        for (let i = 0; i < 25; ++i) {
          let angle = Math.random() * 2 * Math.PI;
          let distance = Math.random() ** 0.5 * this.spraySize;
          let { ox, oy } = {
            ox: x + Math.sin(angle) * distance,
            oy: y + Math.cos(angle) * distance
          };

          circle.moveTo(ox, oy);
          circle.arc(ox, oy, 1, 0, 2 * Math.PI);
          ctx.fill(circle);
        }
        if (this.ctx.globalAlpha < 0.01) this.ctx.globalAlpha += 0.0001;
        break;
      default:
      case "line":
        ctx.beginPath();
        ctx.moveTo(this.lastPosition.x, this.lastPosition.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        this.lastPosition = { x, y };
        break;
    }
  };

  onMouseMove = event => {
    if (!this.draw) return;
    const { offsetX: x, offsetY: y } = event.nativeEvent;
    this.pos = { x, y };
  };

  componentDidMount() {
    this.canvas = document.getElementById("drawCanvas");
    this.ctx = this.canvas.getContext("2d");
  }

  onClick = event => {
    //console.log("click:", event.target);
  };

  onMouseDown = event => {
    console.log("mouse down");
    const { offsetX: x, offsetY: y } = event.nativeEvent;
    this.lastPosition = { x, y };
    this.pos = { x, y };
    this.draw = true;
    this.ctx.fillStyle = this.state.drawColor;
    this.ctx.globalAlpha = 0.005;
    this.ctx.strokeStyle = this.state.drawColor;
    this.spraySize = this.brushes[this.state.activeBrush];
    if (!this.drawInterval) {
      this.drawInterval = setInterval(this.sprayPaint, 1);
    }
    console.log(this.drawInterval);
  };

  onMouseUp = event => {
    this.draw = false;
    console.log("clear interval");
    clearInterval(this.drawInterval);
    this.drawInterval = null;
  };

  onMouseLeave = event => {
    this.onMouseUp();
    this.setState({ showMenu: true });
  };

  hideMenu = event => {
    this.setState({ showMenu: false });
  };

  clearCanvas = event => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  Canvas(w = 500, h = 400) {
    return (
      <Canvas>
        <canvas
          id="drawCanvas"
          onMouseMove={this.onMouseMove}
          onClick={this.onClick}
          onMouseUp={this.onMouseUp}
          onMouseDown={this.onMouseDown}
          onMouseLeave={this.onMouseLeave}
          onMouseEnter={this.hideMenu}
          width={w}
          height={h}
        />
      </Canvas>
    );
  }

  showPalette = () => {
    return (
      <Palette showMenu={this.state.showMenu}>
        {this.palette.map(color => (
          <span
            key={color}
            onClick={() => {
              this.setState({ drawColor: color });
            }}
            className={`palette ${color === this.state.drawColor && "active"}`}
            style={{ backgroundColor: `${color}` }}
          />
        ))}
      </Palette>
    );
  };

  showBrushes = () => {
    return (
      <BrushMenu>
        Brushes
        {this.brushes.map((brushValue, brushNumber) => (
          <Brush
            onClick={() => {
              this.setState({ activeBrush: brushNumber });
            }}
            key={brushValue}
            active={this.state.activeBrush === brushNumber}
          >
            {brushValue}
          </Brush>
        ))}
      </BrushMenu>
    );
  };

  showMenu = () => {
    return (
      <Menu showMenu={this.state.showMenu}>
        Menu
        <MenuButton onClick={this.clearCanvas}>Clear</MenuButton>
        <MenuButton onClick={this.clearCanvas}>Close</MenuButton>
      </Menu>
    );
  };

  render() {
    return (
      <div className="app">
        <p draggable={false}>What would you like to draw?</p>
        {this.showMenu()}
        {this.showBrushes()}
        {this.Canvas()}
        {this.showPalette()}
      </div>
    );
  }
}

export default App;
