import React from 'react';
import { useScrollHide } from './useScrollHide'; // Adjust the import path accordingly
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import './index.css';

const DialogueTop = (props) => {
  const { CharttableItem, chat_type, Charttable, loadingMask } = props;
  const isVisible = useScrollHide('.dialogue-content-all');

  const close = () => {
    const doDelete = () => {
      props.closeDialogue();
    };
    if (chat_type === 'autopilot') {
      doDelete();
      return;
    }
    Modal.confirm({
      title: window.W_L.reset_dialogue,
      content: window.W_L.reset_dialogue_confirm,
      okText: window.W_L.ok_text,
      cancelText: window.W_L.cancel,
      okType: 'danger',
      onOk: doDelete,
      onCancel: null,
      maskClosable: true,
      autoFocusButton: null,
    });
  };

  return (
    <>
      {Charttable && CharttableItem && CharttableItem.label && (
        <div className={`${chat_type === 'report' ? 'dialogue-top report-top' : 'dialogue-top'} ${isVisible ? '' : 'hidden'}`}>
          {chat_type !== 'viewConversation' && (
            <Button
              disabled={loadingMask}
              type="primary"
              size="small"
              onClick={() => close()}
              style={{ borderRadius: '20px', fontSize: '13px', paddingLeft: '15px', paddingRight: '15px' }}
              ghost
            >
              <i className='fa fa-plus m-r-5' aria-hidden='true' />
              {chat_type === 'autopilot' ? window.W_L.auto_pilot : window.W_L.new_dialogue}
            </Button>
          )}
        </div>
      )}
    </>
  );
};

export default DialogueTop;
