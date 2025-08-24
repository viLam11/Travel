import "./MainThumbnail.scss";
import ticket from "../../assets/ticket.png";
import balloon from "../../assets/hot-air-balloon.png";
import medal from "../../assets/medal.png";
import diamond from "../../assets/diamond.png"

export default function MainThumbnail() {
    return (
        <div>
            <div className="thumbnail">
                <div className="thumbnail-img">
                    <svg className="wave" viewBox="0 0 1440 600" preserveAspectRatio="none">
                        <path
                            d="M 0 580 C 800 430, 1000 700, 1500 488"
                            stroke="white"
                            strokeWidth="55"
                            fill="transparent"
                        />
                    </svg>

                    <div className="thumbnail-text">
                        <h1>Your world of joy </h1>
                        <p>From local escape to far-flung adventures, find what makes you happy anytime, anywhere </p>
                    </div>

                    <div className="thumbnail-search">
                        <div className="left">
                            <div className="item">
                                <div className="text">
                                    Where
                                </div>
                                <div>
                                    Search destinations
                                </div>
                            </div>
                            <div className="item">
                                <div className="text">
                                    When
                                </div>
                                <div>
                                    Search destinations
                                </div>
                            </div>
                            <div className="item">
                                <div className="text">
                                    Where
                                </div>
                                <div>
                                    Search destinations
                                </div>
                            </div>
                        </div>
                        <div className="right">
                            <div className="item btn-search">
                                Search
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="introduction">
                <text>Why choose Tourz</text>

                <div className="items">
                    <div className="item">
                        <img src={ticket} alt="ticket"  />
                        <h4>Ultimate flexibility</h4>
                        <text>You're in control, with free cancellation and payment options to satisfy any plan or budget.</text>
                    </div>
                    <div className="item">
                        <img src={balloon} />
                        <h4>Memoriable experiences</h4>
                        <text>Browser and book tours and activites so incredible, you'll want to tell your friends</text>
                    </div>
                    <div className="item">
                        <img src={diamond} />
                        <h4>Quality at our core</h4>
                        <text>High-quality standards. Millions of reviews. A tourz company.</text>
                    </div>
                    <div className="item">
                         <img src={medal} />
                        <h4>Award-winning support</h4>
                        <text>New prices? New plan? No problem. We're here to help, 24/7.</text>
                    </div>
                </div>
            </div>
        </div>
    )
}