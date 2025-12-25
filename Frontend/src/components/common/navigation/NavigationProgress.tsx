import { useEffect, useState } from "react";
import { useNavigation } from "react-router-dom";
import { Progress } from "@/components/ui/admin/progress";

const NavigationProgress = () => {
    const navigation = useNavigation();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (navigation.state === "loading") {
            setProgress(10);

            const timer = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(timer);
                        return 90;
                    }
                    return prev + Math.random() * 30;
                });
            }, 200);

            return () => clearInterval(timer);
        } else if (navigation.state === "idle") {
            setProgress(100);
            const timer = setTimeout(() => setProgress(0), 200);
            return () => clearTimeout(timer);
        }
    }, [navigation.state]);

    if (progress === 0) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-50">
            <Progress
                value={progress}
                className="h-1 rounded-none"
                style={{
                    transition: progress === 100 ? 'opacity 200ms ease-out' : 'none',
                    opacity: progress === 100 ? 0 : 1,
                }}
            />
        </div>
    );
};

export default NavigationProgress;