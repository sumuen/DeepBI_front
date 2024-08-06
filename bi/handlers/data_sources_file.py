import os
import uuid
import logging
from flask import request
from flask_restful import abort
from bi import models
from bi.handlers.base import BaseResource, json_response
from bi import settings

# Initialize the logger
logger = logging.getLogger(__name__)

class DataSourceFileResource(BaseResource):  # BaseResource
    def get(self, data_source_file_id=None, is_use=None):
        result = {}
        user_id = self.current_user.id
        if data_source_file_id:
            try:
                ds = models.DataSourceFile.file_info(data_source_file_id, user_id)
                if is_use is not None:
                    save_data = {'is_use': int(is_use) == 1}
                    self.update_model(ds, save_data)
                    models.db.session.commit()
                result = ds.to_dict()
            except ValueError:
                logger.error("Data source file with id: %s not found.", data_source_file_id)
                abort(404, message="Data source file not found.")
        else:
            result = models.DataSourceFile.get_user_files(user_id)

        self.record_event(
            {"action": "view", "object_id": data_source_file_id, "object_type": "datafilesource"}
        )
        return json_response({'code': 200, 'data': result})

    def post(self):
        logger.info("PRING ORG %s", self.current_org.id)
        if not settings.DATA_SOURCE_FILE_DIR:
            logger.error("DATA_SOURCE_FILE_DIR not set in settings.")
            abort(400, message="Need set DATA_SOURCE_FILE_DIR")

        if "file" not in request.files:
            logger.error("No file part in the request.")
            abort(400, message="No file part")

        user_id = self.current_user.id
        file = request.files['file']
        if file:
            filename = file.filename
            file_ext = os.path.splitext(filename)[1]
            source_name = filename.replace(file_ext, "")
            file_ext = file_ext.lower()
            if file_ext != '.csv' and file_ext != '.xls' and file_ext != '.xlsx':
                logger.error("Invalid file extension: %s", file_ext)
                abort(400, message='Please upload the csv or excel format file')

            show_source_name = source_name + file_ext
            try:
                add_file_name = 1
                while True:
                    result = models.DataSourceFile.check_have_name(show_source_name, user_id)
                    if result:
                        show_source_name = source_name + "(" + str(add_file_name) + ")" + file_ext
                        add_file_name += 1
                    else:
                        break
            except Exception as e:
                logger.exception("Error checking file name availability.")
                abort(400, message='Upload check file_name error')

            new_filename = str(user_id) + "_" + str(uuid.uuid4()) + file_ext
            try:
                file.save(os.path.join(settings.DATA_SOURCE_FILE_DIR, new_filename))
                result = models.DataSourceFile(
                    user_id=user_id,
                    org_id=self.current_org.id,
                    source_name=show_source_name,
                    file_name=new_filename,
                    is_use=True,
                    file_type=file_ext.replace(".", ""),
                )
                models.db.session.add(result)
                models.db.session.commit()
            except Exception as e:
                logger.exception("Error saving file.")
                abort(400, message='Error saving file')

        else:
            logger.error("No file uploaded.")
            abort(400, message='Please upload the csv format file')

        self.record_event(
            {"action": "create", "object_id": result.id, "object_type": "data_source_file"}
        )
        return json_response(
            {
                'code': 200,
                'data': result.to_dict(),
            }
        )

    def delete(self, data_source_file_id):
        user_id = self.current_user.id
        try:
            data = models.DataSourceFile.file_info(data_source_file_id, user_id)
            file_name = os.path.join(settings.DATA_SOURCE_FILE_DIR, data.filename)
            models.db.session.delete(data)
            self.record_event(
                {
                    "action": "delete",
                    "object_id": data_source_file_id,
                    "object_type": "data_source_file",
                }
            )
            if os.path.isfile(file_name):
                os.remove(file_name)
            models.db.session.commit()
        except Exception as e:
            logger.exception("Error deleting file with id: %s", data_source_file_id)
            abort(400, message=str(e))
        return {"message": "success", "code": 200}
