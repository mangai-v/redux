import React from 'react'
import { useSelector } from 'react-redux'
import { selectPostById } from './postsSlice'
import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import TimeAgo from './TimeAgo'
import PostAuthor from './PostAuthor'
import ReactionButtons from './ReactionButtons'
 const SinglePostPage = () => {
    const {postId} = useParams()
    const post = useSelector(state => selectPostById(state, Number(postId)))
    if(!post) {
        return (
            <section>
                <h2>Post not found!</h2>
            </section>
        )
    }
  return (
    <article>
        <h2>{post.title}</h2>
        <p className='excerpt'>{post.body.substring(0, 100)}</p>
        <p className="postCredit"> 
            <Link to={`/post/edit/${post.id}`}>Edit Post</Link>
            <PostAuthor userId = {post.userId}/>
            <TimeAgo timestamp = {post.date}/>
        </p>
        <ReactionButtons post={post}/>
        
    </article>
  )
}
export default SinglePostPage