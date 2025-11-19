import React, { useState, useRef } from 'react'
import SkeletonOverlay from './SkeletonOverlay'
import VideoUploader from './VideoUploader'
import ChatUI from './ChatUI'



export default function App(){
const [sessionId, setSessionId] = useState(null)
const [report, setReport] = useState(null)
const [overlayData, setOverlayData] = useState(null)
const [loading, setLoading] = useState(false)
const videoRef = useRef(null)


async function handleUploadResult(result){
// result expected: { session_id, report, overlay }
setSessionId(result.session_id || (new Date().getTime()).toString())
setReport(result.report || null)
setOverlayData(result.overlay || null)
}


return (
<div className="app-root">
<header className="app-header">
<h1>AI Rehab Chatbot — Phase 1 (Frontend)</h1>
</header>


<main className="app-main">
<section className="left">
<VideoUploader
onResult={handleUploadResult}
setLoading={setLoading}
videoRef={videoRef}
/>


<div className="video-wrap">
<video ref={videoRef} controls style={{maxWidth:'100%'}} />
{overlayData && videoRef.current && (
<SkeletonOverlay videoRef={videoRef} overlayData={overlayData} />
)}
</div>


{report && (
<div className="report-box">
<h3>Auto Report (summary)</h3>
<pre>{JSON.stringify(report, null, 2)}</pre>
</div>
)}
</section>


<aside className="right">
<ChatUI sessionId={sessionId} initialReport={report} />
</aside>
</main>


<footer className="app-footer">Made for FYP — connect backend at /api/upload and /api/chat</footer>
</div>
)
}