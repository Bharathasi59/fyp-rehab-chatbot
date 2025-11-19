import React, { useState } from 'react'


export default function VideoUploader({ onResult, setLoading, videoRef }){
const [file, setFile] = useState(null)
const [progress, setProgress] = useState(0)


function onFileChange(e){
const f = e.target.files[0]
setFile(f)
if (videoRef && videoRef.current){
const url = URL.createObjectURL(f)
videoRef.current.src = url
}
}


async function upload(){
if (!file) return alert('choose a video first')
setLoading(true)
setProgress(5)


try{
const form = new FormData()
form.append('video', file)


const resp = await fetch('http://127.0.0.1:8000/api/upload', {
method: 'POST',
body: form
})


if (!resp.ok) throw new Error('upload failed: ' + resp.status)


// If backend supports streaming progress, adapt here. We'll poll for JSON.
const data = await resp.json()
setProgress(100)
onResult(data)
}catch(err){
console.error(err)
alert('Upload failed: ' + err.message)
}finally{
setLoading(false)
setTimeout(()=>setProgress(0), 800)
}
}
return (
<div className="uploader">
<label className="label">Upload exercise video</label>
<input type="file" accept="video/*" onChange={onFileChange} />
<div style={{marginTop:8}}>
<button onClick={upload} className="btn">Upload & Analyze</button>
<span style={{marginLeft:12}}>{progress > 0 ? `Progress: ${progress}%` : ''}</span>
</div>


<div style={{marginTop:8,fontSize:12,color:'#666'}}>
Tips: use a side or front camera, ensure whole body visible, keep phone stable.
</div>
</div>
)
}