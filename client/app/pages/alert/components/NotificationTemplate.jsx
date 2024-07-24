import React, { useState } from "react";
import PropTypes from "prop-types";
import { head, isEmpty, isNull, isUndefined } from "lodash";
import Mustache from "mustache";

import HelpTrigger from "@/components/HelpTrigger";
import { Alert as AlertType, Query as QueryType } from "@/components/proptypes";

import Input from "antd/lib/input";
import Select from "antd/lib/select";
import Modal from "antd/lib/modal";
import Switch from "antd/lib/switch";

import "./NotificationTemplate.less";

function normalizeCustomTemplateData(alert, query, columnNames, resultValues) {
  const topValue = !isEmpty(resultValues) ? head(resultValues)[alert.options.column] : null;

  return {
    ALERT_STATUS: "TRIGGERED",
    ALERT_CONDITION: alert.options.op,
    ALERT_THRESHOLD: alert.options.value,
    ALERT_NAME: alert.name,
    ALERT_URL: `${window.location.origin}/alerts/${alert.id}`,
    QUERY_NAME: query.name,
    QUERY_URL: `${window.location.origin}/queries/${query.id}`,
    QUERY_RESULT_VALUE: isNull(topValue) || isUndefined(topValue) ? "UNKNOWN" : topValue,
    QUERY_RESULT_ROWS: resultValues,
    QUERY_RESULT_COLS: columnNames,
  };
}

function NotificationTemplate({ alert, query, columnNames, resultValues, subject, setSubject, body, setBody }) {
  const hasContent = !!(subject || body);
  const [enabled, setEnabled] = useState(hasContent ? 1 : 0);
  const [showPreview, setShowPreview] = useState(false);

  const renderData = normalizeCustomTemplateData(alert, query, columnNames, resultValues);

  const render = tmpl => Mustache.render(tmpl || "", renderData);
  const onEnabledChange = value => {
    if (value || !hasContent) {
      setEnabled(value);
      setShowPreview(false);
    } else {
      Modal.confirm({
        title: window.W_L.are_you_sure,
        content: window.W_L.switch_warning,
        okText: window.W_L.ok_text,
        cancelText: window.W_L.cancel,
        onOk: () => {
          setSubject(null);
          setBody(null);
          setEnabled(value);
          setShowPreview(false);
        },
        maskClosable: true,
        autoFocusButton: null,
      });
    }
  };

  return (
    <div className="alert-template">
      <Select
        value={enabled}
        onChange={onEnabledChange}
        optionLabelProp="label"
        dropdownMatchSelectWidth={false}
        style={{ width: "fit-content" }}>
        <Select.Option value={0} label={window.W_L.use_default_template}>
          {window.W_L.default_template}
        </Select.Option>
        <Select.Option value={1} label={window.W_L.use_custom_template}>
          {window.W_L.custom_template}
        </Select.Option>
      </Select>
      {!!enabled && (
        <div className="alert-custom-template" data-test="AlertCustomTemplate">
          <div className="d-flex align-items-center">
            <h5 className="flex-fill">{window.W_L.subject} / {window.W_L.content}</h5>
            {window.W_L.preview}{" "}
            <Switch size="small" className="alert-template-preview" value={showPreview} onChange={setShowPreview} />
          </div>
          {/* TODO: consider adding real labels (not clear for sighted users as well) */}
          <Input
            value={showPreview ? render(subject) : subject}
            aria-label="Subject"
            onChange={e => setSubject(e.target.value)}
            disabled={showPreview}
            data-test="CustomSubject"
          />
          <Input.TextArea
            value={showPreview ? render(body) : body}
            aria-label="Body"
            autoSize={{ minRows: 9 }}
            onChange={e => setBody(e.target.value)}
            disabled={showPreview}
            data-test="CustomBody"
          />
          <HelpTrigger type="ALERT_NOTIF_TEMPLATE_GUIDE" className="f-13">
            <i className="fa fa-question-circle" aria-hidden="true" /> {window.W_L.guide_format}{" "}
            <span className="sr-only">({window.W_L.help})</span>
          </HelpTrigger>
        </div>
      )}
    </div>
  );
}

NotificationTemplate.propTypes = {
  alert: AlertType.isRequired,
  query: QueryType.isRequired,
  columnNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  resultValues: PropTypes.arrayOf(PropTypes.any).isRequired,
  subject: PropTypes.string,
  setSubject: PropTypes.func.isRequired,
  body: PropTypes.string,
  setBody: PropTypes.func.isRequired,
};

NotificationTemplate.defaultProps = {
  subject: "",
  body: "",
};

export default NotificationTemplate;
