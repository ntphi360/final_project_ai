import {CloudUpload, FileSpreadsheet, Trash2} from 'lucide-react'
import {useRef, useState} from 'react'

function formatFileSize(bytes) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function fileType(fileName) {
    return fileName.toLowerCase().endsWith('.csv') ? 'CSV' : 'Excel'
}

export default function ImportDropzone({file, error, onSelect, onRemove}) {
    const inputRef = useRef(null)
    const [dragging, setDragging] = useState(false)

    const handleDrop = (event) => {
        event.preventDefault()
        setDragging(false)
        const droppedFile = event.dataTransfer.files?.[0]
        if (droppedFile) onSelect(droppedFile)
    }

    return (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div
                className={`flex min-h-72 flex-col items-center justify-center rounded-lg border-2 border-dashed px-5 py-8 text-center transition ${dragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/50'}`}
                onDragEnter={(event) => {
                    event.preventDefault();
                    setDragging(true)
                }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
            >
                <span className="grid h-16 w-16 place-items-center rounded-full bg-blue-100 text-blue-600"><CloudUpload
                    size={34} strokeWidth={1.8}/></span>
                <p className="mt-5 text-sm font-semibold text-slate-800">Kéo thả file vào đây hoặc <button type="button"
                                                                                                           className="text-blue-600 hover:underline"
                                                                                                           onClick={() => inputRef.current?.click()}>chọn
                    file</button></p>
                <p className="mt-2 text-xs leading-5 text-slate-500">Hỗ trợ file Excel (.xlsx, .xls) hoặc CSV<br/>Dung
                    lượng tối đa 20 MB</p>
                <button type="button"
                        className="mt-5 h-10 rounded-md bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                        onClick={() => inputRef.current?.click()}>Chọn file
                </button>
                <input
                    ref={inputRef}
                    type="file"
                    className="sr-only"
                    accept=".csv,.xlsx,.xls"
                    onChange={(event) => {
                        const selectedFile = event.target.files?.[0]
                        if (selectedFile) onSelect(selectedFile)
                        event.target.value = ''
                    }}
                />
            </div>

            {error &&
                <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
                   role="alert">{error}</p>}

            {file && (
                <article className="mt-3 flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
                    <span
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-white text-blue-600"><FileSpreadsheet
                        size={23}/></span>
                    <div className="min-w-0 flex-1">
                        <strong className="block truncate text-sm text-slate-900" title={file.name}>{file.name}</strong>
                        <span
                            className="mt-1 block text-xs text-slate-500">{formatFileSize(file.size)} · {fileType(file.name)}</span>
                    </div>
                    <button type="button" aria-label="Xóa file"
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-red-500 transition hover:bg-red-100"
                            onClick={onRemove}><Trash2 size={18}/></button>
                </article>
            )}
        </section>
    )
}
