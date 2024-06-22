import { createAsyncThunk, createSelector, createSlice, createEntityAdapter} from "@reduxjs/toolkit";
import axios from "axios";
import { sub } from 'date-fns';


const POSTS_URL = 'https://jsonplaceholder.typicode.com/posts'

const postsAdapter = createEntityAdapter({
    sortComparer : (a,b) => b.date.localeCompare(a.date)
})

const initialState = postsAdapter.getInitialState({
    status : 'idle',
    error : null,
    count : 0
})

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
    const response = await axios.get(POSTS_URL)
    return response.data
})

export const addNewPost = createAsyncThunk('posts/addNewPost', async (initialPost) => {
    const response = await axios.post(POSTS_URL, initialPost)
    return response.data
})

export const updatePost = createAsyncThunk('posts/updatePost', async (initialPost) => {
    const { id } = initialPost;
    try {
        const response = await axios.put(`${POSTS_URL}/${id}`, initialPost)
        return response.data
    } catch (err) {
        // return err.message;
        return initialPost; // only for testing Redux!
    }
})

export const deletePost = createAsyncThunk('posts/deletePost', async(initialPost) => {
    const {id} = initialPost
    try {
        const response = await axios.delete(`${POSTS_URL}/${id}`)
        if(response?.status === 200) return initialPost
        return `${response.status}: ${response?.statusText}`
    } catch (error) {
        return error.message
    }
})

const postsSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
       
        reactionAdded(state, action) {
            const { postId, reaction } = action.payload
            const existingPost = state.entities[postId]
            if (existingPost) {
                existingPost.reactions[reaction]++
            }
        },
        increaseCount(state,action) {
            state.count = state.count+1
        }

    },
    extraReducers(builder) {
        builder
            .addCase(fetchPosts.pending ,(state,action) => {
                state.status = 'loading'
            })
            .addCase(fetchPosts.fulfilled ,(state,action) => {
                state.status = 'succeeded'
                let min = 1
                const loadedPosts = action.payload.map(post => {
                    post.date = sub(new Date(),{minutes:min++}).toISOString()
                    post.reactions = {
                        thumbsUp: 0,
                        wow: 0,
                        heart: 0,
                        rocket: 0,
                        coffee: 0
                    }
                    return post
                })
                // state.posts = state.posts.concat(loadedPosts)
                postsAdapter.upsertMany(state, loadedPosts)
            })
            .addCase(fetchPosts.rejected,(state,action) => {
                state.status = 'failed'
                state.error = action.error.message
            })
            .addCase(addNewPost.fulfilled , (state,action) => {
                const sortedPosts = state.posts.sort((a,b) => {
                    if (a.id > b.id) return 1
                    if(a.id < b.id) return -1
                    return 0
                })
                action.payload.id = sortedPosts[sortedPosts.length-1].id +1
                action.payload.userId = Number(action.payload.userId)
                action.payload.date = new Date().toISOString()
                action.payload.reactions = {
                    thumbsUp: 0,
                    wow: 0,
                    heart: 0,
                    rocket: 0,
                    coffee: 0
                }
                // state.posts.push(action.payload)
                postsAdapter.addOne(state, action.payload)
            })
            .addCase(updatePost.fulfilled, (state,action) => {
                if(!action.payload?.id) {
                    console.log('update could not complete')
                    console.log(action.payload)
                    return
                }
                // const {id} = action.payload
                action.payload.date = new Date().toISOString()
                // const posts = state.posts.filter(post => post.id !==id)
                // state.posts = [...posts,action.payload]
                postsAdapter.upsertOne(state, action.payload)
            })
            .addCase(deletePost.fulfilled, (state,action) => {
                if(!action.payload?.id) {
                    console.log('Delete could not complete');
                    console.log(action.payload);
                    return
                }
                const {id} = action.payload
                // const posts = state.posts.filter(post => post.id !== id)
                // state.posts = posts
                postsAdapter.removeOne(state, id)
            })
            
    }
})

// export const selectAllPosts = (state) => state.posts.posts;
//getSelectors creates these selectors and we rename them with aliases using destructuring
export const {selectAll:selectAllPosts,selectById:selectPostById,selectIds:selectPostIds} = postsAdapter.getSelectors(state => state.posts)
export const getPostsStatus = (state) => state.posts.status;
export const getPostsError = (state) => state.posts.error;
export const getCount = (state) => state.posts.count;

// export const selectPostById = (state, postId) => 
//     state.posts.posts.find(post => post.id === postId)

export const selectPostsByUser = createSelector([selectAllPosts,(state,userId)=>userId],(posts,userId) => posts.filter(post => post.userId === userId))
export const { increaseCount, reactionAdded } = postsSlice.actions

export default postsSlice.reducer