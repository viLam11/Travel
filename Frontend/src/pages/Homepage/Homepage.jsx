import "./Homepage.scss"
import MainThumbnail from "../../components/Thumbnail/MainThumbnail"
import TrendingDestination from "../../components/Thumbnail/TrendingDestination"

export default function Homepage() {
    return (
        <div className="justify-center items-center self-center m-auto w-full ">
            <div className="w-full">
                <div className="w-11/12 mx-auto">
                    <div className="mx-auto flex flex-row justify-between items-center py-4">
                        <div className="w-10">
                            <div className="comp-name">Vitours</div>
                        </div>
                        <div className="border rounded-md w-1/3 h-10 items-center flex justify-center">
                            <div className="p-4 flex items-center">Search destinations or activities</div>
                        </div>
                        <div className="nav">
                            <div className="nav-item">
                                Destinations
                            </div>
                            <div className="nav-item">
                                Activities
                            </div>
                            <div className="nav-item">
                                News
                            </div>
                            <div className="nav-item">
                                Sign up
                            </div>
                            <div className="nav-item">
                                Log in
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <MainThumbnail />
            <div className="body">
                <TrendingDestination />
            </div>

            <div className="discount">
                <div className="left">
                    <div className="discount-text">
                        <span>
                            Grab up to <span className="hightlight">35% of </span>
                            on your favorite destinations.
                        </span>
                        <span className="small-text"> Limited time offer, don't miss the opportunity!</span>
                    </div>
                    <div className="discount-button">
                        Book Now
                    </div>

                </div>
                <div className="right"></div>
            </div>

            <div className="popular-things">
                <div className="title">
                    <div className="name">Popular things to do</div>
                    <div className="more">See all</div>
                </div>
                <div className="body">
                    <div className="col-1">
                        <div className="cruise">
                            <text>Cruises</text>
                        </div>
                        <div className="museum">
                            <text>Museum Tour</text>
                        </div>
                    </div>
                    <div className="col-2">
                        <div className="beach">
                            <text>Beach Tour</text>
                        </div>
                    </div>
                    <div className="col-3">
                        <div className="row-1">

                        </div>
                        <div className="row-2">
                            <div className="food">
                                <text>Food</text>
                            </div>
                            <div className="hiking">
                                <text>Hiking</text>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

        </div>
    )
}