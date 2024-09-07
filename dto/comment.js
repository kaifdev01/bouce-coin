class CommentDTO {
    constructor(comment) {
        this._id = comment._id;
        this.createdAt = comment.createdAt;
        this.content = comment.content;
        this.authorUsername = comment.author.username;

        if (comment.author) {
            this.authorName = comment.author.name;
            this.authorUsername = comment.author.username;
        } else {
            console.log("Comment author is missing:", comment);
        }

    }
}

module.exports = CommentDTO;