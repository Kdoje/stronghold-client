import React from 'react';
import {useDroppable} from '@dnd-kit/core';

export function Droppable(props: any) {
    const {isOver, setNodeRef} = useDroppable({
        id: props.id,
        data: {zoneName: "board", location: props.id} // TODO use this to indicate the desitination zone
      });
      const style = {
        color: isOver ? 'green' : undefined,
      };
      
      
      return (
        <div ref={setNodeRef} style={style}>
          {props.children}
        </div>
      );
}