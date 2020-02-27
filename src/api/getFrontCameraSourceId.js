import g from '../global';
import intl from '../intl/intl';

const getFrontCameraSourceId = () => {
  const mediaDevices = window.navigator.mediaDevices;
  if (!mediaDevices) {
    g.showError({
      unexpectedErr: new Error(
        `Can not access mediaDevices, check if your connection is https secure`,
      ),
    });
    return null;
  }
  return mediaDevices
    .enumerateDevices()
    .then(a => a.find(i => /video/i.test(i.kind) && /front/i.test(i.facing)))
    .then(i => i?.id)
    .catch(err => {
      g.showError({
        message: intl`Failed to get front camera information`,
        err,
      });
    });
};

export default getFrontCameraSourceId;