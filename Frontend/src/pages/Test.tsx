// import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Post {
    id: string;
    title: string;
}

function wait(duration: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, duration));
}

const POSTS: Post[] = [
    { id: "1", title: "Post 1" },
    { id: "2", title: "Post 2" },
];

export default function Test() {
    const queryClient = useQueryClient();
    
    const postsQuery = useQuery({
        queryKey: ["posts"],
        queryFn: async (obj): Promise<Post[]> => {
            console.log(obj);
            return wait(100).then(() => [...POSTS]);
        },
    });

    const newPostMutation = useMutation({
        mutationFn: async (title: string): Promise<void> => {
            return wait(1000).then(() => {
                POSTS.push({ id: crypto.randomUUID(), title: title });
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        }
    });

    if (postsQuery.isLoading || postsQuery.isFetching) {
        return <div>Loading...</div>;
    }
    
    if (postsQuery.isError) {
        const errorMessage = postsQuery.error instanceof Error 
            ? postsQuery.error.message 
            : 'Unknown error occurred';
        return <div>Error loading posts: {errorMessage}</div>;
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-4">Test Page</h1>
            <p className="text-lg text-gray-700">This is a test page.</p>
            <>
                {postsQuery.data?.map(item => (
                    <div key={item.id}>{item.title}</div>
                ))}

                <button 
                    disabled={newPostMutation.isPending} 
                    className="border-black rounded-md w-20 bg-amber-200 hover:bg-amber-400" 
                    onClick={() => {
                        newPostMutation.mutate(`New post`);
                    }}
                >
                    Add Post
                </button>
            </>
        </div>
    );
}