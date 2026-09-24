// PROTOTYPE — the stage's base layer, graded the way mockups/grade.py tones the PNGs down: a flat charcoal
// field with one soft light from the top-left and a faint, desaturated nebula drifting through it.
// B3: the right column's DarkVeil (darkveil.jsx) sits on top of this, so it no longer tracks the split.
// Grain + vignette are CSS layers above both.
import { useEffect, useRef } from "react";
import { RM } from "./ui.jsx";

const VERT = `attribute vec2 a;varying vec2 v;void main(){v=a*.5+.5;gl_Position=vec4(a,0.,1.);}`;
const FRAG = `precision highp float;
varying vec2 v;uniform float t;uniform vec2 res;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}
float band(vec2 p,vec2 c,float r,float w){float d=length(p-c)-r;return exp(-d*d/(w*w));}
void main(){
  float ys=1.-v.y;
  vec2 p=vec2(v.x*res.x/res.y,ys);
  float T=t*.03;
  vec2 w=vec2(fbm(p*1.6+vec2(T,0.)),fbm(p*1.6+vec2(4.3,-T)))-.5;
  vec2 q=p+w*.24;
  float s=0.;
  s+=band(q,vec2(1.30+.05*sin(T*1.3),-1.05),1.40,.040);
  s+=band(q,vec2(2.05,1.70+.05*cos(T)),1.12,.055)*.9;
  s+=band(q,vec2(0.35,1.55),0.95,.050)*.6;
  s+=band(q,vec2(1.62,0.30+.04*sin(T*1.7)),0.62,.028)*.55;
  s+=band(q,vec2(0.95,-0.35),0.80,.035)*.5;
  float cl=fbm(q*2.2+vec2(-T*.7,T*.4));
  s=min(s,1.1);
  float neb=s*(.35+.9*cl)+smoothstep(.5,.98,cl)*.24;
  float amt=.09;
  vec3 blue=vec3(.12,.23,.82);
  float l=dot(blue,vec3(.2126,.7152,.0722));
  blue=mix(blue,vec3(l*1.6),.62);
  vec3 col=blue*neb*amt*1.3;
  col+=vec3(.55,.68,1.)*pow(s,9.)*.10*amt;
  vec2 g=floor(v*res*.5);float r=h(g);
  col+=vec3(.75,.82,1.)*smoothstep(.9978,1.,r)*(.5+.5*sin(t*1.2+r*400.))*.18;
  vec3 field=(.044-.014*ys)*vec3(.88,.95,1.05);
  vec2 gg=vec2(v.x-.05,ys-.06);
  field+=exp(-(gg.x*gg.x/.10+gg.y*gg.y/.34))*.026*vec3(.5,.7,1.);
  gl_FragColor=vec4(col+field,1.);
}`;

function draw2d(c) {
  const x = c.getContext("2d");
  x.fillStyle = "#0b0c0f";
  x.fillRect(0, 0, c.width, c.height);
}

export function Nebula() {
  const ref = useRef(null);

  useEffect(() => {
    const c = ref.current;
    const gl = c.getContext("webgl", { antialias: false, preserveDrawingBuffer: true });
    if (!gl) return draw2d(c);
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return draw2d(c);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    const uT = gl.getUniformLocation(prog, "t");
    gl.uniform2f(gl.getUniformLocation(prog, "res"), c.width, c.height);
    gl.viewport(0, 0, c.width, c.height);

    let last = -1e9,
      raf = 0;
    const t0 = performance.now() - 40000;
    const frame = (ts) => {
      if (!RM) raf = requestAnimationFrame(frame); // reduced motion: one still frame
      if (ts - last < 33) return; // ~30fps is plenty for a slow drift
      last = ts;
      gl.uniform1f(uT, RM ? 40 : (ts - t0) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Low-res buffer, scaled up by CSS: the nebula is all low frequency anyway.
  return <canvas ref={ref} className="nebula" width={836} height={470} aria-hidden="true" />;
}
