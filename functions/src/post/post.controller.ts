import { Controller, Get, Post, Put, Delete, Param, Body, HttpCode, HttpStatus, UseGuards, Query } from "@nestjs/common";
import { ApiInternalServerErrorResponse, ApiTags } from "@nestjs/swagger";
import { PostService } from "./post.service";
import { CreatePost } from "./interfaces/create-post.interface";
import { UpdatePost } from "./interfaces/update-post.interface";
import { CreatePostLike } from "./interfaces/create-post-like.interface";
import { AuthJwtGuard } from "src/auth/guards/jwt-auth.guard";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";

@Controller("post")
@ApiTags("Post")
@ApiInternalServerErrorResponse({ description: "Oh, something went wrong" })
export class PostController {
    constructor(private readonly postService: PostService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    async getAllPosts(@Query("page") page: number = 1, @Query("limit") limit: number = 10) {
        return await this.postService.getAllPosts({ page, limit });
    }

    @Get("search")
    @HttpCode(HttpStatus.OK)
    async findPosts(@Query("text") text: string) {
        return await this.postService.findPosts(text);
    }

    @Get(":postId")
    @HttpCode(HttpStatus.OK)
    async getPostById(@Param("postId") postId: string) {
        return await this.postService.getPostById(postId);
    }

    @Get("user/:userId")
    @HttpCode(HttpStatus.OK)
    async getPostByUserId(@Param("userId") userId: string) {
        return await this.postService.getPostByUserId(userId);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthJwtGuard)
    async createPost(@Body() createPostDto: CreatePost, @CurrentUser() user) {
        return await this.postService.createPost({ ...createPostDto, userId: user.userId });
    }

    @Post(":postId/like")
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthJwtGuard)
    async createPostLike(@Param("postId") postId: string, @Body() createPostLikeDto: CreatePostLike, @CurrentUser() user) {
        return await this.postService.createPostLike({ ...createPostLikeDto, postId: postId, userId: user.userId });
    }

    @Put(":postId")
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthJwtGuard)
    async updatePost(@Param("postId") postId: string, @Body() updatePostDto: UpdatePost, @CurrentUser() user) {
        return await this.postService.updatePost(postId, updatePostDto, user.userId);
    }

    @Delete(":postId")
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(AuthJwtGuard)
    async deletePost(@Param("postId") postId: string, @CurrentUser() user) {
        return await this.postService.deletePost(postId, user.userId);
    }
}
