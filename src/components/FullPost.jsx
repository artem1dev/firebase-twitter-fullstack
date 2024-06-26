import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

import routes from "../routes.js";
import CommentsPost from "./CommentsPost.jsx";
import CreateCommentPost from "./CreateCommentPost";

export default function FullPost() {
    const navigate = useNavigate();
    const { currentUser, token } = JSON.parse(localStorage.getItem("currentUser"));
    const postId = useParams().id;
    const [post, setPosts] = useState(null);
    useEffect(() => {
        const fetchInfoPost = async (postId) => {
            const response = await axios.get(routes.getPostsById(postId));
            return response.data;
        };
        fetchInfoPost(postId).then((data) => {
            setPosts(data);
        });
    }, []);
    const [editDataTitle, setEditDataTitle] = useState("");
    const [editDataContent, setEditDataContent] = useState("");
    const [isEdite, setEdite] = useState(false);
    useEffect(() => {
        if (post?.title !== undefined) {
            setEditDataTitle(post?.title);
        }
        if (post?.content !== undefined) {
            setEditDataContent(post?.content);
        }
    }, [post]);

    const editePost = async (values) => {
        setEdite(false);
        window.location.reload(false);
        await axios.put(
            routes.updatePost(postId),
            {
                content: editDataContent,
                title: editDataTitle,
            },
            {
                headers: {
                    authorization: token,
                },
            },
        );
        window.location.reload();
    };

    return (
        <div className="FullPostBlock">
            <div className="FullPostContent">
                <h1 className="FullPostTitle">{post?.title}</h1>
                <hr className="bg-white" />
                <div className="FullPostText">
                    <p>{post?.content}</p>
                    {currentUser?.userId === post?.userId ? (
                        isEdite ? (
                            <>
                                <form onSubmit={editePost} className="EditPostForm">
                                    <textarea
                                        id="edit_title"
                                        className="edit_title"
                                        name="edit_title"
                                        type="text"
                                        onChange={(e) => setEditDataTitle(e.target.value)}
                                        value={editDataTitle}
                                    />
                                    <textarea
                                        id="edit_content"
                                        className="edit_content"
                                        name="edit_content"
                                        type="text"
                                        onChange={(e) => setEditDataContent(e.target.value)}
                                        value={editDataContent}
                                    />
                                    <div className="EditPostBtnBlock">
                                        <button type="submit" className="SaveEdit_btn">
                                            Save edit
                                        </button>
                                        <button onClick={() => setEdite(false)} className="CancelEdit_btn">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div>
                                <button className="EditPost_btn" onClick={() => setEdite(true)}>
                                    Edit
                                </button>
                            </div>
                        )
                    ) : null}
                    {currentUser?.userId === post?.userId ? (
                        <>
                            <button
                                onClick={async () => {
                                    await axios.delete(routes.deletePost(postId), {
                                        headers: {
                                            authorization: token,
                                        },
                                    });
                                    navigate("/");
                                    window.location.reload();
                                }}
                                className="CancelEdit_btn"
                            >
                                Delete post
                            </button>
                        </>
                    ) : null}
                </div>

                <div>
                    <p>
                        <button
                            onClick={async () => {
                                await axios.post(
                                    routes.createPostLike(postId),
                                    {
                                        like: true,
                                    },
                                    {
                                        headers: {
                                            authorization: token,
                                        },
                                    },
                                );
                                window.location.reload();
                            }}
                        >
                            <img alt="some" src="/like.png" className="userimg" />
                        </button>
                        {post?.likeCount}
                    </p>
                    <p>
                        <button
                            onClick={async () => {
                                await axios.post(
                                    routes.createPostLike(postId),
                                    {
                                        like: false,
                                    },
                                    {
                                        headers: {
                                            authorization: token,
                                        },
                                    },
                                );
                                window.location.reload();
                            }}
                        >
                            <img alt="some" src="/dislike.png" className="userimg" />
                        </button>
                        {post?.dislikeCount}
                    </p>
                </div>
                <h2>Comments</h2>
                <hr className="bg-white" />
                <CreateCommentPost postId={postId} />
                <div className="FullPostComment">
                    <ul>
                        {post?.comments.map((comment) => {
                            return (
                                <li key={comment._id}>
                                    <CommentsPost
                                        idComment={comment.id}
                                        comment={comment}
                                        userName={comment.name}
                                        userLastname={comment.lastname}
                                        token={token}
                                        postId={postId}
                                    />
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
}
