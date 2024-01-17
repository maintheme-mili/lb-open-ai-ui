import { Input } from "antd";
import { useEffect, useState } from "react";

export default function TextareaStep({ onTitleChange, onSubmit, title, step }) {
  const [content, setContent] =
    useState(`在 ClickPrompt 上，有一个用户反馈了一个问题，帮我分析一下他的问题原因可能是什么？

$issue$
`);
  const [caption, setCaption] = useState(title);

  useEffect(() => {
    onTitleChange && onTitleChange(caption);
  }, [caption]);

  return (
    <div className="step-item">
      <div className="item-title">
        <div className="item-title">
          Step {step}.
          <Input
            className="title-input"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>
      </div>
      <div className="grey-bg">
        <span className="item-avatar">
          <div className="avatar-img">PH</div>
        </span>
        <div className="item-text-area-content">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>
        </div>
      </div>
      <div className="item-prompt">
        <div className="prompt-wrapper">
          <button
            className="prompt-button"
            onClick={() => onSubmit({ title: caption, content })}
          >
            <p className="button-content">Prompt</p>
          </button>
        </div>
      </div>
    </div>
  );
}
