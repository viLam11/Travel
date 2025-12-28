import { useEffect } from 'react';

interface Tour {
    image: string;
    title: string;
    location: string;
    duration: string;
    price: number;
    description?: string;
    name?: string;
}

interface TourSmallCardProps {
    tour: Tour;
}

export default function TourSmallCard({ tour }: TourSmallCardProps){
    useEffect(() => {
        console.log(`TourSmallCard mounted for tour: ${tour.location}`);
    }, [tour]);

    return (
        <div className="tour-small-card">
            <img src={tour.image} alt={tour.name || tour.title} />
            <div className="tour-info">
                <div className="location">{tour.location}</div>
                <span>{tour.title}</span>
                <p>{tour.description}</p>
            </div>
            <div className="tour-details">
                <span className="duration">{tour.duration}</span>
                <div>
                    <span className="price-label">From </span>
                    <span className="price"> ${tour.price}</span>
                </div>
            </div>
        </div>
    );
}