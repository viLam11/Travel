import React, { useEffect, useState } from 'react';
export default function TourSmallCard({ tour }) {
    useEffect(() => {

        console.log(`TourSmallCard mounted for tour: ${tour.location}`);
    }, [tour]);

    return (
        <div className="tour-small-card">
            <img src={tour.image} alt={tour.name} />
            <div className="tour-info">
                <div className="location">{tour.location}</div>
                <text>{tour.title}</text>
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