import React, { useEffect, useRef, useState } from 'react';
import { X, PenTool, Type, Trash2, Download, Check } from 'lucide-react';
import * as fabric from 'fabric';
import { jsPDF } from 'jspdf';

interface TeacherNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (dataUrl: string) => void;
  initialImage?: string;
}

export default function TeacherNoteModal({ isOpen, onClose, onSave, initialImage }: TeacherNoteModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);

  useEffect(() => {
    if (isOpen && canvasRef.current && !fabricCanvas) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        isDrawingMode: false,
        width: window.innerWidth > 900 ? 800 : window.innerWidth - 64,
        height: 500,
        backgroundColor: '#f8fafc'
      });
      setFabricCanvas(canvas);

      if (initialImage) {
        fabric.Image.fromURL(initialImage).then((img) => {
          const targetWidth = canvas.width || 800;
          img.scaleToWidth(targetWidth);
          img.set({ left: 0, top: 0 });
          canvas.add(img);
          const newHeight = Math.max(500, img.getScaledHeight());
          canvas.setDimensions({ width: targetWidth, height: newHeight });
          canvas.renderAll();
        }).catch(err => console.error("Error loading initial image:", err));
      }

      const handlePaste = (e: ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (!blob) continue;
            
            const reader = new FileReader();
            reader.onload = async (event) => {
              if (event.target?.result) {
                try {
                  const img = await fabric.Image.fromURL(event.target.result as string);
                  const targetWidth = canvas.width || 800;
                  img.scaleToWidth(targetWidth);
                  
                  // Calculate dynamic Y position based on bottom-most object
                  let currentY = 0;
                  const objects = canvas.getObjects();
                  if (objects.length > 0) {
                    currentY = Math.max(...objects.map(obj => (obj.top || 0) + (obj.getScaledHeight() || 0)));
                  }
                  
                  img.set({
                    left: 0,
                    top: currentY
                  });
                  
                  // Always update canvas height to fit all images
                  const newHeight = Math.max(500, currentY + img.getScaledHeight());
                  canvas.setDimensions({ width: canvas.width || 800, height: newHeight });
                  canvas.calcOffset();

                  canvas.add(img);
                  canvas.renderAll();
                  
                  // Auto scroll to bottom
                  setTimeout(() => {
                    if (scrollContainerRef.current) {
                      scrollContainerRef.current.scrollTo({
                        top: scrollContainerRef.current.scrollHeight,
                        behavior: 'smooth'
                      });
                    }
                  }, 100);
                } catch (err) {
                  console.error("Error loading image:", err);
                }
              }
            };
            reader.readAsDataURL(blob);
          }
        }
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          // Don't delete if editing text
          if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
          
          const activeObjects = canvas.getActiveObjects();
          if (activeObjects.length) {
            activeObjects.forEach(obj => canvas.remove(obj));
            canvas.discardActiveObject();
            canvas.renderAll();
          }
        }
      };

      window.addEventListener('paste', handlePaste);
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('paste', handlePaste);
        window.removeEventListener('keydown', handleKeyDown);
        canvas.dispose();
        setFabricCanvas(null);
      };
    }
  }, [isOpen]);

  const enableDraw = () => {
    if (fabricCanvas) {
      fabricCanvas.isDrawingMode = !fabricCanvas.isDrawingMode;
      if (fabricCanvas.isDrawingMode) {
        const brush = new fabric.PencilBrush(fabricCanvas);
        brush.width = 3;
        brush.color = 'red';
        fabricCanvas.freeDrawingBrush = brush;
      }
    }
  };

  const addText = () => {
    if (fabricCanvas) {
      const text = new fabric.IText('Ghi chú...', {
        left: 100,
        top: 100,
        fill: 'blue',
        fontSize: 20,
        fontFamily: 'sans-serif'
      });
      fabricCanvas.add(text);
      fabricCanvas.setActiveObject(text);
      fabricCanvas.renderAll();
    }
  };

  const clearCanvas = () => {
    if (fabricCanvas) {
      fabricCanvas.clear();
      fabricCanvas.backgroundColor = '#f8fafc';
      fabricCanvas.setDimensions({ width: fabricCanvas.width || 800, height: 500 });
      fabricCanvas.renderAll();
    }
  };

  const deleteSelected = () => {
    if (fabricCanvas) {
      const activeObjects = fabricCanvas.getActiveObjects();
      if (activeObjects.length) {
        activeObjects.forEach(obj => fabricCanvas.remove(obj));
        fabricCanvas.discardActiveObject();
        fabricCanvas.renderAll();
      }
    }
  };

  const savePDF = () => {
    if (fabricCanvas && canvasRef.current) {
      const dataURL = canvasRef.current.toDataURL('image/png');
      const width = fabricCanvas.width || 800;
      const height = fabricCanvas.height || 500;
      
      const pdf = new jsPDF({
        orientation: width > height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [width, height]
      });
      
      pdf.addImage(dataURL, 'PNG', 0, 0, width, height);
      pdf.save('vocal_note.pdf');
    }
  };

  const handleComplete = () => {
    if (fabricCanvas && canvasRef.current) {
      const dataURL = canvasRef.current.toDataURL('image/png');
      if (onSave) {
        onSave(dataURL);
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="font-bold text-lg text-slate-800">Dán Screenshot và ghi chú</h3>
            <p className="text-xs text-slate-500">Nhấn Ctrl+V (hoặc Cmd+V) để dán ảnh vào đây</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        
        <div className="p-4 flex gap-2 bg-white border-b border-slate-100 overflow-x-auto">
          <button onClick={enableDraw} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${fabricCanvas?.isDrawingMode ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
            <PenTool size={16} /> Vẽ
          </button>
          <button onClick={addText} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-semibold text-slate-700 transition-colors">
            <Type size={16} /> Text
          </button>
          <button onClick={clearCanvas} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-semibold text-slate-700 transition-colors">
            <Trash2 size={16} /> Xoá tất cả
          </button>
          <button onClick={deleteSelected} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-semibold text-red-600 transition-colors">
            <X size={16} /> Xoá đã chọn
          </button>
          <div className="flex-1"></div>
          <button onClick={savePDF} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors">
            <Download size={16} /> Tải PDF
          </button>
          <button onClick={handleComplete} className="flex items-center gap-2 px-4 py-2 bg-[#3A5A42] hover:bg-[#2D4633] text-white rounded-lg text-sm font-semibold transition-colors">
            <Check size={16} /> Hoàn thành
          </button>
        </div>

        <div ref={scrollContainerRef} className="p-4 flex-1 overflow-y-auto bg-slate-100">
          <div className="flex justify-center min-h-full">
            <div className="shadow-md bg-white rounded-lg overflow-hidden h-fit">
              <canvas ref={canvasRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
