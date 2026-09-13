import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const Rating = ({ rating }) => {
  const fullStars = Math.floor(rating);  
  const hasHalfStar = rating - fullStars >= 0.5;  
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex">
      {[...Array(fullStars)].map((_, index) => (
        <FaStar key={index} className="text-primary w-3 h-3 lg:w-4 lg:h-4" />
      ))}

      {hasHalfStar && <FaStarHalfAlt className="text-primary w-3 h-3 lg:w-4 lg:h-4" />}

      {[...Array(emptyStars)].map((_, index) => (
        <FaRegStar key={index} className="text-gray-400 w-3 h-3 lg:w-4 lg:h-4" />
      ))}
    </div>
  );
};

export default Rating;
