import React, { useState, useEffect, useRef } from 'react';
import type { PageObject, EditorMode } from '../../types/notebook';
import { db } from '../../db/database';
import { Icon } from '../common/Icon';

interface ImageObjectsLayerProps {
  objects: PageObject[];
  editorMode: EditorMode;
  onUpdateObject: (obj: PageObject) => void;
  onDeleteObject: (objId: string, blobId: string) => void;
}

export const ImageObjectsLayer: React.FC<ImageObjectsLayerProps> = ({
  objects,
  editorMode,
  onUpdateObject,
  onDeleteObject,
}) => {
  const [blobUrls, setBlobUrls] = useState<Record<string, string>>({});
  const [activeObjectId, setActiveObjectId] = useState<string | null>(null);

  const dragRef = useRef<{
    isDragging: boolean;
    isResizing: boolean;
    objId: string;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    initialW: number;
    initialH: number;
  } | null>(null);

  // Active object is only valid when in 'move' mode
  const effectiveActiveId = editorMode === 'move' ? activeObjectId : null;

  // Click outside listener to deselect image and remove border/handles
  useEffect(() => {
    const handleGlobalPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest('.page-image-object')) {
        setActiveObjectId(null);
      }
    };

    window.addEventListener('pointerdown', handleGlobalPointerDown);
    return () => window.removeEventListener('pointerdown', handleGlobalPointerDown);
  }, []);

  // Load blob URLs for objects
  useEffect(() => {
    let isMounted = true;

    const loadBlobs = async () => {
      for (const obj of objects) {
        try {
          const record = await db.blobs.get(obj.blobId);
          if (record && record.blob && isMounted) {
            const url = URL.createObjectURL(record.blob);
            setBlobUrls((prev) => (prev[obj.blobId] ? prev : { ...prev, [obj.blobId]: url }));
          }
        } catch (err) {
          console.error('Failed to load blob:', err);
        }
      }
    };

    loadBlobs();

    return () => {
      isMounted = false;
    };
  }, [objects]);

  const handlePointerDownDrag = (e: React.PointerEvent, obj: PageObject) => {
    if (editorMode !== 'move') return;
    e.stopPropagation();
    setActiveObjectId(obj.id);

    dragRef.current = {
      isDragging: true,
      isResizing: false,
      objId: obj.id,
      startX: e.clientX,
      startY: e.clientY,
      initialX: obj.x,
      initialY: obj.y,
      initialW: obj.w,
      initialH: obj.h,
    };

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerDownResize = (e: React.PointerEvent, obj: PageObject) => {
    e.stopPropagation();
    setActiveObjectId(obj.id);

    dragRef.current = {
      isDragging: false,
      isResizing: true,
      objId: obj.id,
      startX: e.clientX,
      startY: e.clientY,
      initialX: obj.x,
      initialY: obj.y,
      initialW: obj.w,
      initialH: obj.h,
    };

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const { isDragging, isResizing, objId, startX, startY, initialX, initialY, initialW, initialH } =
      dragRef.current;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    const targetObj = objects.find((o) => o.id === objId);
    if (!targetObj) return;

    if (isDragging) {
      onUpdateObject({
        ...targetObj,
        x: Math.max(0, initialX + dx),
        y: Math.max(0, initialY + dy),
      });
    } else if (isResizing) {
      onUpdateObject({
        ...targetObj,
        w: Math.max(80, initialW + dx),
        h: Math.max(60, initialH + dy),
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragRef.current) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      dragRef.current = null;
    }
  };

  const isMove = editorMode === 'move';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: isMove ? 'auto' : 'none',
        zIndex: 4,
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {objects.map((obj) => {
        const url = blobUrls[obj.blobId];
        const isSelected = activeObjectId === obj.id && isMove;

        return (
          <div
            key={obj.id}
            className="page-image-object"
            style={{
              position: 'absolute',
              left: `${obj.x}px`,
              top: `${obj.y}px`,
              width: `${obj.w}px`,
              height: `${obj.h}px`,
              cursor: isMove ? 'grab' : 'default',
              userSelect: 'none',
              borderRadius: '8px',
              border: isSelected ? '2px solid var(--pen-indigo)' : 'none',
              boxShadow: isSelected ? '0 4px 14px rgba(123, 127, 214, 0.35)' : 'none',
              pointerEvents: isMove ? 'auto' : 'none',
              overflow: 'visible',
            }}
            onClick={(e) => {
              if (isMove) {
                e.stopPropagation();
                setActiveObjectId(obj.id);
              }
            }}
            onPointerDown={(e) => {
              if (isMove) {
                handlePointerDownDrag(e, obj);
              }
            }}
          >
            {url ? (
              <img
                src={url}
                alt={obj.name || 'Attachment'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '6px',
                  display: 'block',
                  pointerEvents: 'none',
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'grid',
                  placeContent: 'center',
                  background: 'var(--surface-alt)',
                  color: 'var(--muted)',
                  fontSize: '0.8rem',
                }}
              >
                Loading image...
              </div>
            )}

            {/* Controls (Delete & Resize handle) - ONLY visible when selected in Move mode */}
            {isSelected && (
              <>
                {/* Delete button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteObject(obj.id, obj.blobId);
                    setActiveObjectId(null);
                  }}
                  title="Delete image"
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    width: '24px',
                    height: '24px',
                    background: '#E07A9B',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'grid',
                    placeContent: 'center',
                    boxShadow: 'var(--shadow-sm)',
                    zIndex: 10,
                  }}
                >
                  <Icon name="close" size={12} />
                </button>

                {/* Resize Handle at bottom right */}
                <div
                  onPointerDown={(e) => handlePointerDownResize(e, obj)}
                  title="Drag to resize"
                  style={{
                    position: 'absolute',
                    bottom: '-6px',
                    right: '-6px',
                    width: '16px',
                    height: '16px',
                    background: 'var(--pen-indigo)',
                    border: '2px solid #FFF',
                    borderRadius: '4px',
                    cursor: 'nwse-resize',
                    zIndex: 10,
                  }}
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};
