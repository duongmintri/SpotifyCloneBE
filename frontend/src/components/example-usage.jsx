import { showSuccessToast, showErrorToast, showConfirmToast } from '../utils/toast';

// Ví dụ sử dụng:
const handleSaveData = async () => {
  try {
    // Gọi API lưu dữ liệu
    await saveDataToAPI(data);
    showSuccessToast('Dữ liệu đã được lưu thành công!');
  } catch (error) {
    showErrorToast('Không thể lưu dữ liệu. Vui lòng thử lại sau.');
  }
};

// Ví dụ sử dụng toast xác nhận:
const handleDelete = () => {
  showConfirmToast(
    'Bạn có chắc chắn muốn xóa mục này không?',
    async () => {
      try {
        await deleteItem(itemId);
        showSuccessToast('Đã xóa thành công!');
        // Xử lý sau khi xóa
      } catch (error) {
        showErrorToast('Không thể xóa. Vui lòng thử lại sau.');
      }
    }
  );
};