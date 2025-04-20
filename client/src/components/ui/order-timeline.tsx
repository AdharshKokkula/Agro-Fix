import { cn } from "@/lib/utils";
import { 
  Check, 
  Clock, 
  Truck, 
  PackageOpen 
} from "lucide-react";

interface TimelineEvent {
  status: string;
  date: string;
  time: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

interface OrderTimelineProps {
  events: TimelineEvent[];
}

export function OrderTimeline({ events }: OrderTimelineProps) {
  const getIconForStatus = (status: string, isCompleted: boolean, isCurrent: boolean) => {
    if (isCompleted) {
      return <Check className="h-4 w-4" />;
    }

    switch (status) {
      case "Order Placed":
      case "Order Confirmed":
        return <Check className="h-4 w-4" />;
      case "In Progress":
        return <Clock className="h-4 w-4" />;
      case "Out for Delivery":
        return <Truck className="h-4 w-4" />;
      case "Delivered":
        return <PackageOpen className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {events.map((event, index) => (
        <div className="flex" key={index}>
          <div className="flex flex-col items-center mr-4">
            <div
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-full text-white",
                event.isCompleted
                  ? "bg-green-500"
                  : event.isCurrent
                  ? "bg-amber-500"
                  : "bg-gray-300 text-gray-500"
              )}
            >
              {getIconForStatus(event.status, event.isCompleted, event.isCurrent)}
            </div>
            {index < events.length - 1 && (
              <div 
                className={cn(
                  "h-full w-0.5 mt-2",
                  event.isCompleted
                    ? "bg-green-500"
                    : "bg-gray-300"
                )}
              ></div>
            )}
          </div>
          <div>
            <h5 
              className={cn(
                "text-base font-medium",
                event.isCompleted || event.isCurrent
                  ? "text-gray-900"
                  : "text-gray-500"
              )}
            >
              {event.status}
            </h5>
            <p className="text-sm text-gray-600">
              {event.isCompleted || event.isCurrent 
                ? `${event.date} - ${event.time}` 
                : "Pending"}
            </p>
            {(event.isCompleted || event.isCurrent) && (
              <p className="text-sm text-gray-600 mt-1">{event.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
