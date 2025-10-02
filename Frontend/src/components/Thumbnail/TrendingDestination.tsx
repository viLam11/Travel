import "./TrendingDestination.scss";
import sing from "../../assets/sing.png";
import roma from "../../assets/roma.png";
import paris from "../../assets/paris.png";
import tour1 from '../../assets/tour1.png';
import tour2 from '../../assets/tour2.png';
import tour3 from '../../assets/tour3.png';
import tour4 from '../../assets/tour4.png';
import tour5 from '../../assets/tour5.png';
import tour6 from '../../assets/tour6.png';
import tour7 from '../../assets/tour7.png';
import TourSmallCard from "../Tours/TourSmallCard";

interface TourImage {
    image: string;
    title: string;
    location: string;
    duration: string;
    price: number;
}

const TOURIMGS: TourImage[] = [{
    image: tour1,
    title: 'Centipede Tour - Guided Arizona Desert Tour By ATV',
    location: 'Arizona, USA',
    duration: '4 days',
    price: 100
}, {
    image: tour2,
    title: 'Molokini and Turtle Town, Snorkeling Adventure Aboard',
    location: 'Hawaii, USA',
    duration: '3 days',
    price: 150
}, {
    image: tour3,
    title: 'Westminster Walking Tour & Westminster Abbey Entry',
    location: 'London, UK',
    duration: '2 days',
    price: 200
}, {
    image: tour4,
    title: 'All Inclusive Ultimate Circle Island Day Tour with Lunch',
    location: 'Hawaii, USA',
    duration: '1 day',
    price: 250
}, {
    image: tour5,
    title: 'Clear Kayak Tour of Shell Island with Dolphin Sightings',
    location: 'Florida, USA',
    duration: '3 days',
    price: 300
}, {
    image: tour6,
    title: 'History and Hauntings of Salem Guided Walking Tour',
    location: 'Salem, MA',
    duration: '2 days',
    price: 350
}, {
    image: tour7,
    title: 'Mauna Kea Summit and Stars Small-Group Adventure',
    location: 'Hawaii, USA',
    duration: '4 days',
    price: 400
}];

const DEST_IMGS: string[] = [sing, roma, paris];

export default function TrendingDestination(){
    return (
        <div className="trending-dest">
            <div className="text">
                <h3>Trending Destinations</h3>
                <div>
                    <span>See all</span>
                </div>
            </div>

            <div className="container-trending">
                {Array.from({ length: 7 }, (_, index) => (
                    <div className="dest" key={index}>
                        <img src={DEST_IMGS[index % DEST_IMGS.length]} alt={`Destination ${index + 1}`} />
                        <span>Paris</span>
                    </div>
                ))}
            </div>

            <div className="popular-tours">
                {Array.from({ length: 7 }, (_, index) => {
                    return (
                        <TourSmallCard key={index} tour={TOURIMGS[index]} />
                    )
                })}
            </div>
        </div>
    )
}