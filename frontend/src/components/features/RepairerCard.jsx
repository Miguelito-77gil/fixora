import { Link } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import VerificationBadge from "@/components/features/VerificationBadge";
import Rating from "@/components/features/Rating";

function RepairerCard({ repairer }) {
  return (
    <Card className="overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5">
      
      <div className="h-40 bg-[#eee9e3]">
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#efe7df] to-[#dcd5cd]">
          <span className="text-5xl font-bold text-[#9b806a]">
            {repairer.initials}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-[#17202a]">
                {repairer.name}
              </h3>

              <VerificationBadge verified={repairer.verified} />
            </div>

            <p className="mt-1 text-sm text-[#777f86]">
              {repairer.category}
            </p>
          </div>

          {repairer.available && (
            <span className="whitespace-nowrap text-xs font-medium text-[#2b8052]">
              Available
            </span>
          )}
        </div>

        <div className="mt-3">
          <Rating
            rating={repairer.rating}
            reviews={repairer.reviews}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-[#777f86]">
            {repairer.repairs} repairs
          </span>

          <span className="font-semibold text-[#26313b]">
            From ₱{repairer.price}
          </span>
        </div>

        <p className="mt-2 text-sm text-[#777f86]">
          {repairer.location}
        </p>

        <Button
          to={`/repairer/${repairer.id}`}
          variant="secondary"
          className="mt-3 w-full"
        >
          View profile
        </Button>
      </div>
    </Card>
  );
}

export default RepairerCard;

