import React, { memo, useEffect, useRef, useState } from "react";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import Embed from "@editorjs/embed";
import Warning from "@editorjs/warning";
import LinkTool from "@editorjs/link";
import Image from "@editorjs/image";
import Marker from "@editorjs/marker";
import SimpleImage from "@editorjs/simple-image";



type Props = {
  data?: OutputData;
  onChange(val: OutputData): void;
  holder: string;
};


const EDITOR_TOOLS = {

};

const EditorBlock = ({ data, onChange, holder }: Props) => {
  //add a reference to editor
  const ref = useRef<EditorJS>();

  //initialize editorjs
  useEffect(() => {
    //initialize editor if we don't have a reference
    if (!ref.current) {
      const editor = new EditorJS({
        holder: holder,
        tools: EDITOR_TOOLS,
        data,
        async onChange(api, event) {
          const data = await api.saver.save();
          onChange(data);
        },
      });
      ref.current = editor;
    }

    //add a return function handle cleanup
    return () => {
      if (ref.current && ref.current.destroy) {
        ref.current.destroy();
      }
    };
  }, []);


  return <div id={holder} />;
};

export default memo(EditorBlock);

