'use client'

import { useState, useEffect } from "react"; // useEffect hinzugefügt
import { reorderAccounts } from "@/app/actions";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AccountCard } from "./account-card";
import { AddAccountDialog } from "./add-account-dialog";

// Hilfskomponente für die einzelne sortierbare Karte
function SortableItem({ acc }: { acc: any }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: acc.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
      <AccountCard acc={acc} />
    </div>
  );
}

export function SortableAccountList({ initialAccounts }: { initialAccounts: any[] }) {
    const [items, setItems] = useState(initialAccounts);
    useEffect(() => {
        setItems(initialAccounts);
    }, [initialAccounts]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8,
        },
        }),
        useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    async function handleDragEnd(event: any) {
        const { active, over } = event;
        if (active.id !== over.id) {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        setItems(newItems);
        
        await reorderAccounts(newItems.map(i => i.id));
        }
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SortableContext items={items.map(i => i.id)} strategy={horizontalListSortingStrategy}>
            {items.map((acc) => (
                <SortableItem key={acc.id} acc={acc} />
            ))}
            </SortableContext>
            <AddAccountDialog />
        </section>
        </DndContext>
    );
}