import React, { useMemo, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import html2canvas from 'html2canvas'
import {
  Camera,
  Candy,
  Check,
  ChevronLeft,
  Cloud,
  Download,
  Film,
  Flower2,
  IceCreamBowl,
  Play,
  Rainbow,
  Rocket,
  Scissors,
  Sparkles,
  Stamp,
  TreePine,
  Upload,
  WandSparkles,
} from 'lucide-react'

const steps = [
  { id: 0, label: 'Capture' },
  { id: 2, label: 'Decorate' },
  { id: 3, label: 'Export' },
]
const timers = [0, 3, 5, 10]
const layoutOptions = ['polaroid2r', 'strip3', 'strip4', 'grid6', 'grid8']
const getLayoutCount = (layout) => ({ polaroid2r: 1, strip3: 3, strip4: 4, grid6: 6, grid8: 8 }[layout] ?? 1)

const framePalette = ['#ff5dab', '#ffdf43', '#5be1bf', '#79d9ff', '#9b7cff', '#ff8a3d', '#ef4444', '#22c55e', '#2563eb', '#111827', '#ffffff', '#8b5e34']

const filters = [
  { id: 'none', label: 'Original', className: 'filter-none' },
  { id: 'grayscale', label: 'Grayscale', className: 'grayscale contrast-105' },
  { id: 'sepia', label: 'Sepia', className: 'sepia saturate-125 contrast-105' },
  { id: 'vintage', label: 'Vintage', className: 'sepia contrast-110 saturate-75 brightness-95' },
]

const templates = [
  { id: 'polaroid', label: 'Classic Polaroid', icon: Camera, mode: 'css' },
  { id: 'birthday', label: 'Birthday Edition', icon: IceCreamBowl, mode: 'css' },
  { id: 'newspaper', label: 'Newspaper Frame', icon: Stamp, mode: 'css' },
  { id: 'film', label: 'Retro Film Frame', icon: Film, mode: 'css' },
  { id: 'bubble', label: 'Bubble Light Frame', icon: Sparkles, mode: 'css' },
  { id: 'aurora', label: 'Aurora Glow Frame', icon: WandSparkles, mode: 'png-overlay' },
  { id: 'paper', label: 'Worn-out Paper', icon: Scissors, mode: 'css' },
  { id: 'wood', label: 'Rustic Wood', icon: TreePine, mode: 'css' },
  { id: 'lace', label: 'Vintage Lace', icon: Flower2, mode: 'png-overlay' },
  { id: 'cake', label: 'Cake Pop', icon: IceCreamBowl, mode: 'css' },
  { id: 'darkpop', label: 'Dark Pop', icon: Sparkles, mode: 'css' },
  { id: 'candy', label: 'Candy Shop', icon: Candy, mode: 'css' },
  { id: 'dream', label: 'Dream Cloud', icon: Cloud, mode: 'css' },
]

const stickerCatalog = [
  { id: 'flower', label: 'Flower', icon: Flower2, color: '#ff5dab' },
  { id: 'rainbow', label: 'Rainbow', icon: Rainbow, color: '#9b7cff' },
  { id: 'candy', label: 'Candy', icon: Candy, color: '#ff5dab' },
  { id: 'icecream', label: 'Ice cream', icon: IceCreamBowl, color: '#ffdf43' },
  { id: 'cloud', label: 'Cloud', icon: Cloud, color: '#9bdcff' },
  { id: 'rocket', label: 'Rocket', icon: Rocket, color: '#5be1bf' },
  { id: 'seal', label: 'Wax seal', icon: Sparkles, color: '#ff5dab' },
  { id: 'dried', label: 'Dried flower', icon: Flower2, color: '#5be1bf' },
  { id: 'stamp', label: 'Stamp', icon: Stamp, color: '#ffdf43' },
]

const videoConstraints = {
  facingMode: 'user',
  width: { ideal: 1280 },
  height: { ideal: 960 },
}

function App() {
  const webcamRef = useRef(null)
  const exportRef = useRef(null)
  const [step, setStep] = useState(0)
  const [timer, setTimer] = useState(3)
  const [countdown, setCountdown] = useState(null)
  const [photos, setPhotos] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [layoutCount, setLayoutCount] = useState('polaroid2r')
  const [templateId, setTemplateId] = useState('polaroid')
  const [frameMode, setFrameMode] = useState('light')
  const [filterId, setFilterId] = useState('none')
  const [stickers, setStickers] = useState([])
  const [isExportingVideo, setIsExportingVideo] = useState(false)
  const [retakeIndex, setRetakeIndex] = useState(null)
  const [cameraOn, setCameraOn] = useState(true)
  const [birthdayName, setBirthdayName] = useState('bestie')
  const [frameBg, setFrameBg] = useState('#fff6fc')
  const [frameAccent, setFrameAccent] = useState('#ff5dab')
  const [exportedImage, setExportedImage] = useState(null)
  const [photoAdjustments, setPhotoAdjustments] = useState({})
  const [activePhotoAdjust, setActivePhotoAdjust] = useState(0)

  const selectedPhotos = useMemo(
    () => selectedIds.map((index) => photos[index]).filter(Boolean),
    [photos, selectedIds],
  )
  const activeFilter = filters.find((item) => item.id === filterId) ?? filters[0]
  const activeTemplate = templates.find((item) => item.id === templateId) ?? templates[0]
  const sourcePhotos = selectedPhotos.length ? selectedPhotos : photos
  const framePhotos = sourcePhotos.slice(0, getLayoutCount(layoutCount))
  const currentAdjustPhoto = framePhotos[activePhotoAdjust] ?? framePhotos[0]

  const capturePhoto = () => {
    if (photos.length >= 8 && retakeIndex === null) return
    const shot = webcamRef.current?.getScreenshot()
    if (!shot) return
    setPhotos((current) => {
      if (retakeIndex !== null) {
        const next = [...current]
        next[retakeIndex] = shot
        return next
      }
      return [...current, shot]
    })
    setSelectedIds((current) => {
      if (retakeIndex !== null) return current.includes(retakeIndex) ? current : [...current, retakeIndex]
      const nextIndex = photos.length
      return current.includes(nextIndex) ? current : [...current, nextIndex]
    })
    setRetakeIndex(null)
  }

  const readUploadedPhoto = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.readAsDataURL(file)
    })

  const addUploadedPhoto = async (file) => {
    if (!file || (photos.length >= 8 && retakeIndex === null)) return
    const image = await readUploadedPhoto(file)
    setPhotos((current) => {
      if (retakeIndex !== null) {
        const next = [...current]
        next[retakeIndex] = image
        return next
      }
      return [...current, image]
    })
    setSelectedIds((current) => {
      if (retakeIndex !== null) return current.includes(retakeIndex) ? current : [...current, retakeIndex]
      const nextIndex = photos.length
      return current.includes(nextIndex) ? current : [...current, nextIndex]
    })
    setRetakeIndex(null)
  }

  const startCapture = () => {
    if (timer === 0) {
      capturePhoto()
      return
    }

    let tick = timer
    setCountdown(tick)
    const interval = window.setInterval(() => {
      tick -= 1
      if (tick <= 0) {
        window.clearInterval(interval)
        setCountdown(null)
        capturePhoto()
        return
      }
      setCountdown(tick)
    }, 1000)
  }

  const toggleSelection = (index) => {
    setSelectedIds((current) => {
      if (current.includes(index)) return current.filter((item) => item !== index)
      if (current.length >= 8) return current
      return [...current, index]
    })
  }

  const goDecorate = (ids = selectedIds) => {
    const count = Math.min(ids.length || 1, 8)
    setLayoutCount(count <= 1 ? 'polaroid2r' : count <= 3 ? 'strip3' : count <= 4 ? 'strip4' : count <= 6 ? 'grid6' : 'grid8')
    setStep(2)
  }

  const addSticker = (item) => {
    setStickers((current) => [
      ...current,
      {
        id: `${item.id}-${Date.now()}`,
        label: item.label,
        color: item.color,
        x: 40 + current.length * 18,
        y: 50 + current.length * 14,
        size: 42,
        icon: item.icon,
      },
    ])
  }

  const updatePhotoAdjustment = (photo, patch) => {
    if (!photo) return
    setPhotoAdjustments((current) => ({
      ...current,
      [photo]: { x: 50, y: 50, scale: 1, ...(current[photo] ?? {}), ...patch },
    }))
  }

  const updateSticker = (id, info) => {
    setStickers((current) =>
      current.map((item) => (item.id === id ? { ...item, ...info } : item)),
    )
  }

  const downloadPhoto = async (event) => {
    event?.preventDefault()
    event?.stopPropagation()
    if (!exportRef.current) return
    try {
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: null,
        scale: window.devicePixelRatio > 2 ? 1.5 : 2,
        useCORS: true,
      })
      setExportedImage(canvas.toDataURL('image/png'))
    } catch (error) {
      window.alert('Export gagal. Coba screenshot dulu atau pakai browser Safari/Chrome terbaru.')
    }
  }

  const printPhoto = () => {
    window.print()
  }

  const downloadVideo = async () => {
    if (!exportRef.current || isExportingVideo) return
    setIsExportingVideo(true)
    const snapshot = await html2canvas(exportRef.current, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
    })
    const canvas = document.createElement('canvas')
    canvas.width = snapshot.width
    canvas.height = snapshot.height
    const ctx = canvas.getContext('2d')
    const stream = canvas.captureStream(30)
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' })
    const chunks = []
    recorder.ondataavailable = (event) => event.data.size && chunks.push(event.data)
    const done = new Promise((resolve) => {
      recorder.onstop = resolve
    })
    recorder.start()

    for (let frame = 0; frame < 90; frame += 1) {
      const progress = frame / 89
      const eased = 1 - (1 - progress) ** 3
      const y = Math.round((1 - eased) * -canvas.height * 0.7)
      ctx.fillStyle = '#fff3fb'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.globalAlpha = Math.min(1, progress * 1.8)
      ctx.drawImage(snapshot, 0, y)
      ctx.globalAlpha = 1
      await new Promise((resolve) => window.setTimeout(resolve, 33))
    }

    recorder.stop()
    await done
    const blob = new Blob(chunks, { type: 'video/webm' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'vintage-photobooth-animation.webm'
    link.click()
    URL.revokeObjectURL(link.href)
    setIsExportingVideo(false)
  }

  return (
    <main className="paper-shell relative min-h-screen overflow-hidden px-2 py-2 text-ink sm:px-3">
      <div className="mx-auto flex min-h-[calc(100vh-1rem)] max-w-6xl flex-col gap-5">
        <Header step={step} timer={timer} setTimer={setTimer} setStep={setStep} />
        {step === 0 && (
          <CaptureStep
            countdown={countdown}
            cameraOn={cameraOn}
            setCameraOn={setCameraOn}
            addUploadedPhoto={addUploadedPhoto}
            photos={photos}
            retakeIndex={retakeIndex}
            selectedIds={selectedIds}
            setRetakeIndex={setRetakeIndex}
            startCapture={startCapture}
            toggleSelection={toggleSelection}
            webcamRef={webcamRef}
            onNext={() => goDecorate()}
          />
        )}
        {step === 1 && (
          <SelectionStep
            photos={photos}
            selectedIds={selectedIds}
            toggleSelection={toggleSelection}
            onBack={() => setStep(0)}
            onNext={goDecorate}
          />
        )}
        {step === 2 && (
          <DecorateStep
            activeFilter={activeFilter}
            activeTemplate={activeTemplate}
            addSticker={addSticker}
            exportRef={exportRef}
            downloadPhoto={downloadPhoto}
            printPhoto={printPhoto}
            filterId={filterId}
            filters={filters}
            framePhotos={framePhotos}
            layoutCount={layoutCount}
            frameMode={frameMode}
            selectedPhotos={selectedPhotos}
            setFilterId={setFilterId}
            setFrameMode={setFrameMode}
            setLayoutCount={setLayoutCount}
            setStep={setStep}
            setTemplateId={setTemplateId}
            stickers={stickers}
            templates={templates}
            updateSticker={updateSticker}
            birthdayName={birthdayName}
            setBirthdayName={setBirthdayName}
            frameBg={frameBg}
            setFrameBg={setFrameBg}
            frameAccent={frameAccent}
            setFrameAccent={setFrameAccent}
            photoAdjustments={photoAdjustments}
            activePhotoAdjust={activePhotoAdjust}
            setActivePhotoAdjust={setActivePhotoAdjust}
            currentAdjustPhoto={currentAdjustPhoto}
            updatePhotoAdjustment={updatePhotoAdjustment}
          />
        )}
        {step === 3 && (
          <ExportStep
            activeFilter={activeFilter}
            activeTemplate={activeTemplate}
            downloadPhoto={downloadPhoto}
            downloadVideo={downloadVideo}
            exportRef={exportRef}
            framePhotos={framePhotos}
            frameMode={frameMode}
            isExportingVideo={isExportingVideo}
            layoutCount={layoutCount}
            setStep={setStep}
            stickers={stickers}
            updateSticker={updateSticker}
          />
        )}
        <footer className="pb-2 text-center text-[10px] font-black uppercase tracking-[0.22em] text-ink/45">
          putrinann 2026
        </footer>
      </div>
      {exportedImage && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/80 p-4">
          <div className="max-h-[92vh] w-full max-w-sm rounded-3xl border-4 border-ink bg-white p-3 shadow-[8px_8px_0_#171321]">
            <img src={exportedImage} alt="Final Vanilla Booth export" className="max-h-[70vh] w-full rounded-2xl object-contain" />
            <p className="mt-2 text-center font-type text-[10px] font-black uppercase tracking-[0.12em] text-ink/70">Long press this final frame to save</p>
            <a className="vintage-button mt-3 w-full" href={exportedImage} download="vanilla-booth.png">Download PNG</a>
            <button className="vintage-button secondary mt-2 w-full" onClick={() => setExportedImage(null)} type="button">Close</button>
          </div>
        </div>
      )}
      <IceCreamBowl className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-bubblegum/35" size={42} />
    </main>
  )
}

function Header({ step, timer, setTimer, setStep }) {
  return (
    <header className="vintage-panel mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 px-3 py-2">
      <div className="text-center sm:text-left">
        <h1 className="font-serifDisplay text-2xl font-black tracking-tight text-bubblegum sm:text-4xl">Vanilla Booth</h1>
        <p className="mt-0.5 text-xs font-black uppercase tracking-[0.18em] text-ink/55">pose, pop, save</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {step > 0 && (
          <button className="vintage-button secondary !min-h-0 !px-4 !py-2" onClick={() => setStep(step === 3 ? 2 : 0)} type="button">Back</button>
        )}
        {step === 0 && (
          <div className="flex items-center gap-1 rounded-full border-2 border-ink bg-white p-1">
            {timers.map((item) => (
              <button
                key={item}
                className={`rounded-full px-2 py-1 font-type text-[10px] transition ${timer === item ? 'bg-bubblegum text-white shadow-[2px_2px_0_#171321]' : 'text-ink hover:bg-blush'}`}
                onClick={() => setTimer(item)}
                type="button"
              >
                {item === 0 ? 'No timer' : `${item}s`}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
function CaptureStep({
  webcamRef,
  countdown,
  cameraOn,
  setCameraOn,
  addUploadedPhoto,
  photos,
  retakeIndex,
  selectedIds,
  setRetakeIndex,
  startCapture,
  toggleSelection,
  onNext,
}) {
  return (
    <section className="mx-auto grid w-full max-w-5xl flex-1 items-start justify-center gap-5 lg:grid-cols-[minmax(0,0.86fr)_300px]">
      <div className="mx-auto grid w-full max-w-xl gap-3">
        <div className="vintage-panel relative w-full overflow-hidden p-2 pb-4">
          <div className="relative aspect-[16/10] min-h-[190px]">
            <button
              type="button"
              onClick={() => setCameraOn((value) => !value)}
              className={`absolute right-4 top-4 z-20 rounded-full border-2 border-ink px-3 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0_#171321] ${
                cameraOn ? 'bg-minty text-ink' : 'bg-white text-ink'
              }`}
            >
              {cameraOn ? 'Cam on' : 'Cam off'}
            </button>
            {cameraOn ? (
              <Webcam
                ref={webcamRef}
                mirrored
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="vintage-photo-box h-full w-full bg-ink object-cover"
              />
            ) : (
              <div className="vintage-photo-box grid h-full w-full place-items-center bg-[radial-gradient(circle_at_50%_18%,#ff5dab_0%,#6d28d9_28%,#171321_58%,#05040a_100%)] text-white">
                <div className="text-center">
                  <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-full border-4 border-white bg-sunshine text-ink shadow-[4px_4px_0_#ff5dab]">
                    <Camera size={28} />
                  </div>
                <p className="text-lg font-black text-sunshine">Pick your vibe first</p>
                <p className="mt-1 text-[11px] font-black text-bubblegum">
                  Turn the camera on when you are ready.
                </p>
              </div>
              </div>
            )}
          </div>
          {countdown !== null && (
            <div className="absolute inset-4 grid place-items-center rounded-[1.25rem] bg-ink/35 backdrop-blur-sm">
              <span className="grid h-20 w-20 place-items-center rounded-full border-4 border-white bg-sunshine font-serifDisplay text-4xl text-ink shadow-xl">
                {countdown}
              </span>
            </div>
          )}
          <button
            aria-label="Take photo"
            className="absolute bottom-4 left-1/2 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-full border-4 border-white bg-bubblegum text-white shadow-[4px_4px_0_#171321] transition hover:scale-105 disabled:opacity-50"
            disabled={!cameraOn || photos.length >= 8 || countdown !== null}
            onClick={startCapture}
            type="button"
          >
            <Camera size={20} />
          </button>
        </div>
        <label className="vintage-button secondary mx-auto mt-3 flex w-fit cursor-pointer">
          <Upload size={16} />
          Upload Photo
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              addUploadedPhoto(event.target.files?.[0])
              event.target.value = ''
            }}
          />
        </label>
      </div>
      <aside className="vintage-panel side-panel flex w-full flex-col gap-2 p-2.5">
        <div className="flex items-center justify-center gap-2 text-center">
          <p className="flex flex-wrap items-center justify-center gap-1.5 font-type text-[10px] uppercase tracking-[0.18em]">
            <span className="grid h-6 w-6 place-items-center rounded-full border-2 border-ink bg-[#9bdcff] text-ink">
              <Camera size={13} />
            </span>
            <span>Select to decorate</span>
          </p>
          <span className="shrink-0 rounded-full border-2 border-ink bg-sunshine px-3 py-1 text-[10px] font-black shadow-[2px_2px_0_#171321]">
            {selectedIds.length}/8
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-[1.1rem] ${
                selectedIds.includes(index) ? 'ring-4 ring-[#ff5dab]' : ''
              }`}
            >
              <button
                type="button"
                disabled={!photos[index]}
                onClick={() => toggleSelection(index)}
                className="vintage-photo-box block aspect-[4/3] w-full overflow-hidden bg-white disabled:opacity-60"
              >
                {photos[index] ? (
                  <img src={photos[index]} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="grid h-full place-items-center text-xs font-black text-ink/35">{index + 1}</span>
                )}
              </button>
              {photos[index] && (
                <button
                  type="button"
                  onClick={() => setRetakeIndex(index)}
                  className={`absolute bottom-1 right-1 rounded-full border-2 border-ink px-2 py-0.5 text-[9px] font-black ${
                    retakeIndex === index ? 'bg-[#ffdf43]' : 'bg-white'
                  }`}
                >
                  retake
                </button>
              )}
              {selectedIds.includes(index) && (
                <span className="absolute left-1 top-1 grid h-6 w-6 place-items-center rounded-full border-2 border-ink bg-[#5be1bf]">
                  <Check size={14} />
                </span>
              )}
            </div>
          ))}
        </div>
        <button className="vintage-button mt-auto" disabled={selectedIds.length === 0} onClick={onNext} type="button">
          Go Decoration
        </button>
      </aside>
    </section>
  )
}

function SelectionStep({ photos, selectedIds, toggleSelection, onBack, onNext }) {
  return (
    <section className="vintage-panel flex flex-1 flex-col gap-2 p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serifDisplay text-2xl font-black">Choose your keepsakes</h2>
          <p className="font-type text-xs font-bold text-ink/60">Select 1 to 8 photos for the final frame.</p>
        </div>
        <p className="rounded-full border-2 border-ink bg-sunshine px-3 py-1 font-type text-xs font-black">{selectedIds.length} selected</p>
      </div>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {photos.map((photo, index) => (
          <button
            key={photo}
            className={`group relative overflow-hidden rounded-[0.85rem] border bg-white p-1.5 transition ${
              selectedIds.includes(index) ? 'border-ink shadow-[0_0_0_4px_rgba(255,93,171,0.24)]' : 'border-ink/20'
            }`}
            onClick={() => toggleSelection(index)}
            type="button"
          >
            <img src={photo} alt="" className="vintage-photo-box aspect-[4/3] max-h-32 w-full object-cover sepia-[0.12] lg:max-h-28" />
            {selectedIds.includes(index) && (
              <span className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border-2 border-ink bg-minty text-ink">
                <Check size={18} />
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="mt-auto flex justify-between gap-3">
        <button className="vintage-button secondary" onClick={onBack} type="button">
          <ChevronLeft size={18} /> Retake
        </button>
        <button className="vintage-button" disabled={selectedIds.length === 0} onClick={onNext} type="button">
          Decorate
        </button>
      </div>
    </section>
  )
}

function DecorateStep(props) {
  const {
    activeFilter,
    activeTemplate,
    addSticker,
    downloadPhoto,
    exportRef,
    filterId,
    filters,
    framePhotos,
    frameMode,
    layoutCount,
    printPhoto,
    selectedPhotos,
    setFilterId,
    setFrameMode,
    setLayoutCount,
    setStep,
    setTemplateId,
    stickers,
    templates,
    updateSticker,
    birthdayName,
    setBirthdayName,
    frameBg,
    setFrameBg,
    frameAccent,
    setFrameAccent,
    photoAdjustments,
    activePhotoAdjust,
    setActivePhotoAdjust,
    currentAdjustPhoto,
    updatePhotoAdjustment,
  } = props
  const availableLayouts = layoutOptions.filter((item) => getLayoutCount(item) <= Math.max(framePhotos.length, selectedPhotos.length, 1))

  return (
    <section className="grid flex-1 gap-2 lg:grid-cols-[210px_minmax(0,1fr)_210px]">
      <aside className="vintage-panel space-y-3 p-3">
        <ControlGroup title="Frame Mode">
          <div className="grid grid-cols-2 gap-2">
            {['light', 'dark'].map((mode) => (
              <button
                key={mode}
                className={`mini-button ${frameMode === mode ? 'active' : ''}`}
                onClick={() => setFrameMode(mode)}
                type="button"
              >
                {mode}
              </button>
            ))}
          </div>
        </ControlGroup>
        <ControlGroup title="Grid Layout">
          <div className="grid grid-cols-2 gap-2">
            {availableLayouts.map((count) => (
              <button key={count} className={`mini-button ${layoutCount === count ? 'active' : ''}`} onClick={() => setLayoutCount(count)} type="button">
                {{ polaroid2r: 'Polaroid 2R', strip3: 'Strip 3', strip4: 'Strip 4', grid6: '4R 6', grid8: '4R 8' }[count]}
              </button>
            ))}
          </div>
        </ControlGroup>
        {activeTemplate.id === 'birthday' && (
          <ControlGroup title="Birthday Name">
            <input
              className="cute-input"
              maxLength={18}
              onChange={(event) => setBirthdayName(event.target.value)}
              placeholder="Type name"
              value={birthdayName}
            />
          </ControlGroup>
        )}
        {activeTemplate.id === 'polaroid' && (
          <ControlGroup title="Classic Color">
            <div className="grid grid-cols-5 gap-2">
              {['#fff6fc', '#fff7c8', '#eafff8', '#eaf5ff', '#efe7ff'].map((color) => (
                <button
                  aria-label={color}
                  className={`color-dot ${frameBg === color ? 'active' : ''}`}
                  key={color}
                  onClick={() => setFrameBg(color)}
                  style={{ background: color }}
                  type="button"
                />
              ))}
            </div>
          </ControlGroup>
        )}
        <ControlGroup title="Templates">
          <div className="grid gap-2">
            {templates.map((item) => (
              <button key={item.id} className={`template-button ${activeTemplate.id === item.id ? 'active' : ''}`} onClick={() => setTemplateId(item.id)} type="button">
                <item.icon size={16} /> {item.label}
              </button>
            ))}
          </div>
        </ControlGroup>
      </aside>

      <FramePreview
        activeFilter={activeFilter}
        activeTemplate={activeTemplate}
        exportRef={exportRef}
        frameMode={frameMode}
        layoutCount={layoutCount}
        photos={framePhotos}
        stickers={stickers}
        updateSticker={updateSticker}
        birthdayName={birthdayName}
        frameBg={frameBg}
        frameAccent={frameAccent}
        photoAdjustments={photoAdjustments}
        activePhotoAdjust={activePhotoAdjust}
        setActivePhotoAdjust={setActivePhotoAdjust}
        updatePhotoAdjustment={updatePhotoAdjustment}
      />

      <aside className="vintage-panel space-y-3 p-3">
        <ControlGroup title="Filters">
          <div className="grid grid-cols-2 gap-2">
            {filters.map((item) => (
              <button key={item.id} className={`mini-button ${filterId === item.id ? 'active' : ''}`} onClick={() => setFilterId(item.id)} type="button">
                {item.label}
              </button>
            ))}
          </div>
        </ControlGroup>
        <ControlGroup title="Sticker Tray">
          <div className="grid grid-cols-3 gap-2">
            {stickerCatalog.map((item) => (
              <button key={item.id} className="sticker-button" onClick={() => addSticker(item)} title={item.label} type="button">
                <item.icon size={22} style={{ color: item.color }} />
              </button>
            ))}
          </div>
        </ControlGroup>
        <div className="grid grid-cols-2 gap-2">
          <button className="vintage-button w-full" onClick={downloadPhoto} type="button">
            Download
          </button>
          <button className="vintage-button secondary w-full" onClick={printPhoto} type="button">
            Print
          </button>
        </div>
        {framePhotos.length > 0 && (
          <ControlGroup title="Photo Fit">
            <p className="fit-hint">Pick a slot, then drag the photo in the frame.</p>
            <div className="fit-picker">
              {framePhotos.map((photo, index) => (
                <button
                  className={`fit-thumb ${activePhotoAdjust === index ? 'active' : ''}`}
                  key={`fit-${index}`}
                  onClick={() => setActivePhotoAdjust(index)}
                  type="button"
                >
                  {index + 1}
                </button>
              ))}
            </div>
            {currentAdjustPhoto && (
              <div className="fit-actions">
                <button type="button" onClick={() => updatePhotoAdjustment(currentAdjustPhoto, { y: Math.max(0, (photoAdjustments[currentAdjustPhoto]?.y ?? 50) - 8) })}>Up</button>
                <button type="button" onClick={() => updatePhotoAdjustment(currentAdjustPhoto, { y: Math.min(100, (photoAdjustments[currentAdjustPhoto]?.y ?? 50) + 8) })}>Down</button>
                <button type="button" onClick={() => updatePhotoAdjustment(currentAdjustPhoto, { x: Math.max(0, (photoAdjustments[currentAdjustPhoto]?.x ?? 50) - 8) })}>Left</button>
                <button type="button" onClick={() => updatePhotoAdjustment(currentAdjustPhoto, { x: Math.min(100, (photoAdjustments[currentAdjustPhoto]?.x ?? 50) + 8) })}>Right</button>
                <button type="button" onClick={() => updatePhotoAdjustment(currentAdjustPhoto, { scale: Math.max(1, (photoAdjustments[currentAdjustPhoto]?.scale ?? 1) - 0.1) })}>-</button>
                <button type="button" onClick={() => updatePhotoAdjustment(currentAdjustPhoto, { x: 50, y: 50, scale: 1 })}>Reset</button>
                <button type="button" onClick={() => updatePhotoAdjustment(currentAdjustPhoto, { scale: Math.min(1.8, (photoAdjustments[currentAdjustPhoto]?.scale ?? 1) + 0.1) })}>+</button>
              </div>
            )}
          </ControlGroup>
        )}
        <ControlGroup title="Frame Color">
          <div className="color-palette">
            {framePalette.map((color) => (
              <button
                aria-label={color}
                className={`color-dot ${frameAccent === color ? 'active' : ''}`}
                key={color}
                onClick={() => setFrameAccent(color)}
                style={{ background: color }}
                type="button"
              />
            ))}
          </div>
        </ControlGroup>
      </aside>
    </section>
  )
}

function ExportStep({ activeFilter, activeTemplate, downloadPhoto, downloadVideo, exportRef, frameMode, framePhotos, isExportingVideo, layoutCount, setStep, stickers, updateSticker }) {
  return (
    <section className="grid flex-1 gap-2 lg:grid-cols-[minmax(0,1fr)_220px]">
      <FramePreview
        activeFilter={activeFilter}
        activeTemplate={activeTemplate}
        exportRef={exportRef}
        frameMode={frameMode}
        layoutCount={layoutCount}
        photos={framePhotos}
        stickers={stickers}
        updateSticker={updateSticker}
      />
      <aside className="vintage-panel flex flex-col gap-2 p-3">
        <h2 className="font-serifDisplay text-2xl font-black">Export cabinet</h2>
        <p className="font-type text-xs font-bold text-ink/60">
          Photo export saves PNG. Video export creates a short WebM animation with the final frame sliding down into place.
        </p>
        <button className="vintage-button mt-4" onClick={downloadPhoto} type="button">
          <Download size={18} /> Download Photo
        </button>
        <button className="vintage-button" disabled={isExportingVideo} onClick={downloadVideo} type="button">
          <Play size={18} /> {isExportingVideo ? 'Rendering Video...' : 'Download Video'}
        </button>
        <button className="vintage-button secondary mt-auto" onClick={() => setStep(2)} type="button">
          Back to Decorate
        </button>
      </aside>
    </section>
  )
}

function FramePreview({ activeFilter, activeTemplate, exportRef, frameMode, layoutCount, photos, stickers, updateSticker, birthdayName, frameBg, frameAccent, photoAdjustments, activePhotoAdjust, setActivePhotoAdjust, updatePhotoAdjustment }) {
  const safePhotos = photos.length ? photos : [null]
  const visualLayout = getLayoutCount(layoutCount)
  return (
    <section className="vintage-panel grid min-h-[430px] place-items-center overflow-hidden px-5 py-7">
      <div ref={exportRef} className={`frame-stage template-${activeTemplate.id} mode-${frameMode} layout-${layoutCount}`} style={{ '--classic-bg': frameBg, '--frame-accent': frameAccent }}>
        <TemplateOverlay birthdayName={birthdayName} template={activeTemplate} />
        <div className={`photo-grid photo-count-${visualLayout}`}>
          {Array.from({ length: visualLayout }).map((_, index) => (
            <PhotoCell
              activeFilter={activeFilter}
              activeIndex={activePhotoAdjust}
              adjustment={photoAdjustments[safePhotos[index % safePhotos.length]]}
              index={index}
              key={index}
              photo={safePhotos[index % safePhotos.length]}
              setActivePhotoAdjust={setActivePhotoAdjust}
              updatePhotoAdjustment={updatePhotoAdjustment}
            />
          ))}
        </div>
        {stickers.map((item) => (
          <DraggableSticker key={item.id} sticker={item} updateSticker={updateSticker} />
        ))}
        <div className="frame-credit">created by : putrinann_</div>
      </div>
    </section>
  )
}


function PhotoCell({ activeFilter, activeIndex, adjustment, index, photo, setActivePhotoAdjust, updatePhotoAdjustment }) {
  const adjust = adjustment ?? { x: 50, y: 50, scale: 1 }
  const handlePointerDown = (event) => {
    if (!photo) return
    setActivePhotoAdjust(index)
    const startX = event.clientX
    const startY = event.clientY
    const originX = adjust.x
    const originY = adjust.y
    event.currentTarget.setPointerCapture(event.pointerId)

    const move = (moveEvent) => {
      updatePhotoAdjustment(photo, {
        x: Math.max(0, Math.min(100, originX - (moveEvent.clientX - startX))),
        y: Math.max(0, Math.min(100, originY - (moveEvent.clientY - startY))),
      })
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <div className={`photo-cell ${activeIndex === index ? 'active-fit' : ''}`} onPointerDown={handlePointerDown}>
      {photo ? (
        <img
          src={photo}
          alt=""
          className={`h-full w-full object-cover ${activeFilter.className}`}
          draggable="false"
          style={{ objectPosition: 'center', transform: `translate(${adjust.x - 50}%, ${adjust.y - 50}%) scale(${adjust.scale})` }}
        />
      ) : (
        <Sparkles className="text-bubblegum" size={30} />
      )}
    </div>
  )
}

function TemplateOverlay({ template, birthdayName }) {
  if (template.id === 'newspaper') {
    return (
      <div className="pointer-events-none absolute inset-0 z-10 newspaper-overlay text-ink">
        <div className="news-kicker">Special Edition</div>
        <div className="news-title">Photobooth News</div>
        <div className="news-rule" />
        <div className="news-side news-side-top">Moments that turn into memories</div>
        <div className="news-side news-side-bottom">A collection of today</div>
        <div className="news-caption">
          <b>Youth of today, memories that last forever</b>
          <span>Printed with love and tiny sparks.</span>
        </div>
      </div>
    )
  }

  const copy = {
    polaroid: ['CLASSIC', 'vanilla archive', 'SOFT SAVE', 'one tiny moment, softly saved'],
    birthday: ['HAPPY BIRTHDAY', birthdayName || 'bestie', 'NEXT LEVEL UNLOCKED', 'may you be surrounded by good things'],
    film: ['RETRO ROLL', 'frame no. 08', 'ON FILM', 'freshly developed in the booth'],
    bubble: ['BUBBLE', 'light frame', 'FLOAT ON', 'floating little memories'],
    aurora: ['AURORA', 'night glow', 'SOFT LIGHT', 'northern lights in tiny frames'],
    paper: ['WORN PAPER', 'found note', 'KEEP THIS', 'creased, taped, and kept'],
    wood: ['RUSTIC WOOD', 'warm reel', 'WARM DAYS', 'lit like an old fair booth'],
    lace: ['LACE DIARY', 'delicate edition', 'PURE CHARM', 'soft charm for sweet frames'],
    cake: ['CAKE POP', 'sugar roll', 'SWEET LIFE', 'frosted snapshots forever'],
    darkpop: ['MIDNIGHT POP', 'after dark', 'ICON MODE', 'bold little booth energy'],
    candy: ['CANDY SHOP', 'sweet issue', 'SUGAR RUSH', 'color, sugar, sparkle'],
    dream: ['DREAM CLOUD', 'soft sky', 'STAY SOFT', 'a little blur of magic'],
  }[template.id] ?? ['VANILLA', 'booth', 'pose, pop, save']
  return (
    <div className={`pointer-events-none absolute inset-0 z-10 frame-copy frame-copy-${template.id}`}>
      <div className="frame-eyebrow">{copy[1]}</div>
      <div className="frame-title">{copy[0]}</div>
      <div className="frame-subtitle">{copy[2]}</div>
      <div className="frame-microcopy">{copy[3]}</div>
    </div>
  )
}

function DraggableSticker({ sticker, updateSticker }) {
  const Icon = sticker.icon
  const handlePointerDown = (event) => {
    const startX = event.clientX
    const startY = event.clientY
    const originX = sticker.x
    const originY = sticker.y
    event.currentTarget.setPointerCapture(event.pointerId)

    const move = (moveEvent) => {
      updateSticker(sticker.id, {
        x: originX + moveEvent.clientX - startX,
        y: originY + moveEvent.clientY - startY,
      })
    }

    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <div
      className="absolute z-20 grid cursor-grab touch-none select-none place-items-center p-0 active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      style={{ left: sticker.x, top: sticker.y, color: sticker.color }}
    >
      <Icon size={sticker.size} />
    </div>
  )
}

function ControlGroup({ title, children }) {
  return (
    <div>
      <p className="mb-2 font-type text-xs font-black uppercase tracking-[0.2em] text-bubblegum">{title}</p>
      {children}
    </div>
  )
}

export default App


