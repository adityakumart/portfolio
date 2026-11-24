import { R2Service } from '../../../common/services/r2-storage.service';
import { FileModel, IFileDocument } from './file.model';

export class FilesService {
  static getFileModel() {
    return FileModel;
  }

  static getStorageService() {
    return R2Service;
  }
}
