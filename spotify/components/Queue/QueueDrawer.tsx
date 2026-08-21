"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MdClose, MdDelete, MdDragHandle } from "react-icons/md";
import { usePlayerStore, Track } from "@/store/playerStore";
import { useUIStore } from "@/store/useUIStore";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableQueueItem({
  track,
  index,
  onRemove,
  onPlay,
}: {
  track: Track;
  index: number;
  onRemove: () => void;
  onPlay: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: `queue-${index}-${track.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-2 rounded-lg bg-[#181818] hover:bg-[#252525] group transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer" onClick={onPlay}>
        <span
          {...attributes}
          {...listeners}
          className="text-[#b3b3b3] hover:text-white cursor-grab active:cursor-grabbing p-1"
        >
          <MdDragHandle size={20} />
        </span>
        {track.coverUrl ? (
          <img
            src={track.coverUrl}
            alt={track.title}
            className="w-10 h-10 rounded object-cover flex-shrink-0 shadow"
          />
        ) : (
          <div
            className="w-10 h-10 rounded flex-shrink-0 flex items-center justify-center font-bold text-xs shadow"
            style={{ background: track.bgGradient || "linear-gradient(135deg, #1ed760, #0d7a36)" }}
          >
            ♪
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-bold text-white text-sm truncate">{track.title}</p>
          <p className="text-xs text-[#b3b3b3] truncate">{track.artist}</p>
        </div>
      </div>

      <button
        onClick={onRemove}
        className="text-[#b3b3b3] hover:text-red-400 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        title="Remove from queue"
      >
        <MdDelete size={18} />
      </button>
    </div>
  );
}

export default function QueueDrawer() {
  const { queueOpen, toggleQueue } = useUIStore();
  const { currentTrack, queue, removeFromQueue, clearQueue, reorderQueue, play } = usePlayerStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = queue.findIndex((_, idx) => `queue-${idx}-${queue[idx].id}` === active.id);
      const newIndex = queue.findIndex((_, idx) => `queue-${idx}-${queue[idx].id}` === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderQueue(arrayMove(queue, oldIndex, newIndex));
      }
    }
  }

  return (
    <AnimatePresence>
      {queueOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={toggleQueue}
            className="fixed inset-0 bg-black z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-[90px] w-full max-w-sm bg-[#121212] z-50 border-l border-[#2a2a2a] p-5 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#2a2a2a] mb-4">
              <h2 className="text-xl font-extrabold text-white">Queue</h2>
              <div className="flex items-center gap-2">
                {queue.length > 0 && (
                  <button
                    onClick={clearQueue}
                    className="text-xs font-bold text-[#b3b3b3] hover:text-white uppercase tracking-wider px-2 py-1 rounded hover:bg-[#1f1f1f]"
                  >
                    Clear Queue
                  </button>
                )}
                <button
                  onClick={toggleQueue}
                  className="p-1 text-[#b3b3b3] hover:text-white rounded-full hover:bg-[#1f1f1f]"
                >
                  <MdClose size={22} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-6">
              {/* Now Playing */}
              {currentTrack && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#b3b3b3] mb-3">
                    Now Playing
                  </h3>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#181818] border border-[#1ed760]/30 shadow">
                    {currentTrack.coverUrl ? (
                      <img
                        src={currentTrack.coverUrl}
                        alt={currentTrack.title}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0 shadow-md"
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-lg shadow-md"
                        style={{ background: currentTrack.bgGradient || "linear-gradient(135deg, #1ed760, #0d7a36)" }}
                      >
                        ♪
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[#1ed760] text-sm truncate">{currentTrack.title}</p>
                      <p className="text-xs text-[#b3b3b3] truncate">{currentTrack.artist}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Next Up */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#b3b3b3] mb-3">
                  Next Up ({queue.length})
                </h3>

                {queue.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-[#2a2a2a] rounded-xl text-[#b3b3b3]">
                    <p className="text-sm font-semibold mb-1">Queue is empty</p>
                    <p className="text-xs">Hover over any track and click &quot;Add to Queue&quot;</p>
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={queue.map((t, idx) => `queue-${idx}-${t.id}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="flex flex-col gap-2">
                        {queue.map((track, index) => (
                          <SortableQueueItem
                            key={`queue-${index}-${track.id}`}
                            track={track}
                            index={index}
                            onRemove={() => removeFromQueue(index)}
                            onPlay={() => play(track)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
