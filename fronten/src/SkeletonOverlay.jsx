import React, { useEffect, useRef, useState } from 'react'


// overlayData expected shape: { frames: [{ time: float_seconds, keypoints: [{x: 0..1, y:0..1, score:0..1}], }, ...] }
// This component syncs canvas drawing with the playing video time.


export default function SkeletonOverlay({ videoRef, overlayData }){
const canvasRef = useRef(null)
const rafRef = useRef(null)
const [ready, setReady] = useState(false)


useEffect(()=>{
function onResize(){
const v = videoRef.current
const c = canvasRef.current
if (!v || !c) return
c.width = v.clientWidth
c.height = v.clientHeight
c.style.width = v.clientWidth + 'px'
c.style.height = v.clientHeight + 'px'
}


window.addEventListener('resize', onResize)
onResize()


setReady(true)
return ()=> window.removeEventListener('resize', onResize)
}, [videoRef])

useEffect(()=>{
const video = videoRef.current
const canvas = canvasRef.current
if (!video || !canvas) return
const ctx = canvas.getContext('2d')


function draw(){
if (video.paused || video.ended){
rafRef.current = requestAnimationFrame(draw)
return
}
// clear
ctx.clearRect(0,0,canvas.width,canvas.height)


const t = video.currentTime
// find nearest frame in overlayData
const frames = overlayData.frames || []
if (frames.length === 0) return
// simple nearest search
let nearest = frames[0]
let best = Math.abs(frames[0].time - t)
for (let f of frames){
const d = Math.abs(f.time - t)
if (d < best){ best = d; nearest = f }
}


// draw keypoints & skeleton
const kp = nearest.keypoints || []
const scaleX = canvas.width
const scaleY = canvas.height


// draw connections (simple index-based connections for COCO-like 17 keypoints)
const connections = [
[5,7],[7,9], // left arm
[6,8],[8,10], // right arm
[11,13],[13,15], // left leg
[12,14],[14,16], // right leg
[11,12],[5,6],[0,1] // torso/head rough
]


ctx.lineWidth = 2
ctx.strokeStyle = 'lime'
ctx.fillStyle = 'red'
// draw lines
for (let cidx of connections){
const a = kp[cidx[0]]
const b = kp[cidx[1]]
if (!a || !b) continue
if (a.score < 0.3 || b.score < 0.3) continue
ctx.beginPath()
ctx.moveTo(a.x * scaleX, a.y * scaleY)
ctx.lineTo(b.x * scaleX, b.y * scaleY)
ctx.stroke()
}


// draw points
for (let k of kp){
if (!k) continue
if (k.score < 0.25) continue
ctx.beginPath()
ctx.arc(k.x * scaleX, k.y * scaleY, 4, 0, Math.PI*2)
ctx.fill()
}


rafRef.current = requestAnimationFrame(draw)
}


rafRef.current = requestAnimationFrame(draw)
return ()=> cancelAnimationFrame(rafRef.current)
}, [videoRef, overlayData, ready])

return (
<canvas ref={canvasRef} className="overlay-canvas" style={{position:'absolute', left:0, top:0, pointerEvents:'none'}} />
)
}