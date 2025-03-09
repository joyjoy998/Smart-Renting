import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStarPropertyStore } from "@/stores/useStarPropertyStore";
const FavoriteButton = ({ propertyId }: { propertyId: string | number }) => {
  const { starredProperties, toggleStar } = useStarPropertyStore();
  const isStarred = starredProperties.has(String(propertyId)); // 转换成字符串存储

  return (
    <Button
      variant="ghost"
      className="flex items-center"
      onClick={() => toggleStar(String(propertyId))}>
      <Star
        className={`h-6 w-6 transition-colors ${
          isStarred ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
        }`}
      />
    </Button>
  );
};

export default FavoriteButton;
