// /components/FavoriteButton.tsx
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStarPropertyStore } from "@/stores/useStarPropertyStore";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useGroupIdStore } from "@/stores/useGroupStore"; // 导入获取group_id的store

const FavoriteButton = ({
  propertyId,
  placeData,
}: {
  propertyId: string | number;
  placeData: any;
}) => {
  const { starredProperties, toggleStar } = useStarPropertyStore();
  const isStarred = starredProperties.has(String(propertyId)); // 转换成字符串存储
  const { enqueueSnackbar } = useSnackbar(); // 使用Snackbar来显示通知

  // 从状态管理中获取当前用户的group_id
  const { currentGroupId } = useGroupIdStore(); // 使用您的group_id store
  const groupId = currentGroupId; // 获取当前的group_id

  const handleToggleStar = async () => {
    toggleStar(String(propertyId)); // 更新本地状态

    if (!isStarred) {
      // 如果当前未收藏，则进行保存操作
      const payload = {
        saved_property_id: Math.floor(Math.random() * 1000000), // 生成一个随机的ID
        group_id: groupId, // 使用当前group_id
        property_id: propertyId, // 保存的系统房源ID
        street: placeData.street, // 从placeData获取街道信息
        suburb: placeData.suburb, // 从placeData获取市区信息
        state: placeData.state, // 从placeData获取州信息
        postcode: placeData.postcode, // 从placeData获取邮政编码
        latitude: placeData.latitude, // 从placeData获取纬度
        longitude: placeData.longitude, // 从placeData获取经度
        weekly_rent: placeData.weekly_rent, // 从placeData获取每周租金
        photo: placeData.photo || [], // 从placeData获取照片数组
        bedrooms: placeData.bedrooms, // 从placeData获取卧室数量
        bathrooms: placeData.bathrooms, // 从placeData获取浴室数量
        parking_spaces: placeData.parking_spaces, // 从placeData获取停车位数量
        property_type: placeData.property_type || "Unknown", // 从placeData获取房产类型
        safety_score: placeData.safety_score || 0, // 从placeData获取安全评分
        place_id: placeData.place_id || "", // 确保存在place_id
      };

      try {
        const response = await axios.post("/api/savedProperties", payload);
        if (response.status === 200) {
          enqueueSnackbar("Property saved successfully", {
            variant: "success",
          });
        }
      } catch (error) {
        console.error("Error saving property:", error);
        enqueueSnackbar("Failed to save property", { variant: "error" });
      }
    } else {
      // 如果当前已收藏，则进行删除操作
      try {
        console.log(
          "Deleting property with groupId:",
          groupId,
          "propertyId:",
          propertyId
        );
        const response = await axios.delete("/api/savedProperties", {
          params: {
            group_id: groupId, // 使用当前group_id
            property_id: propertyId, // 使用property_id进行删除
          },
        });
        if (response.status === 200) {
          enqueueSnackbar("Property removed successfully", {
            variant: "success",
          });
        }
      } catch (error) {
        console.error("Error removing property:", error);
        enqueueSnackbar("Failed to remove property", { variant: "error" });
      }
    }
  };

  return (
    <Button
      variant="ghost"
      className="flex items-center"
      onClick={handleToggleStar}>
      <Star
        className={`h-6 w-6 transition-colors ${
          isStarred ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
        }`}
      />
    </Button>
  );
};

export default FavoriteButton;
