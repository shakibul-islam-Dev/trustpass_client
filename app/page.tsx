import SearchHero from "@/components/marketplace/SearchHero";
import Categories from "@/components/marketplace/Categories";
import RatingCard from "@/components/modal/RatingCard";
export default function Home() {
  return (
    <div>
      <RatingCard />
      <SearchHero />
      <Categories />
    </div>
  );
}
