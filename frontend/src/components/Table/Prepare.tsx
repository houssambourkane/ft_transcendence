import { Ball } from './Ball';
import { Player } from './Player';


function	drawBackground(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: any)
{
	ctx.beginPath();
	ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
	ctx.closePath();
}

function	drawLineCircle(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, ball : Ball)
{
	ctx.beginPath();
	ctx.setLineDash([10, 10]);
	ctx.strokeStyle = "WHITE";
	ctx.lineWidth = 1;
	ctx.arc(canvas.width / 2, canvas.height / 2, ball.radius * 15, 0, 2 * Math.PI);
	ctx.moveTo(canvas.width / 2, 0);
  	ctx.lineTo(canvas.width / 2, canvas.height);
	ctx.stroke();
	ctx.setLineDash([]);
	ctx.closePath();
}

function	drawPlayer(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, player : Player)
{
	ctx.beginPath();
	ctx.fillStyle = player.color;
	ctx.fillRect(player.x, player.y, player.width, player.height);
	ctx.lineWidth = 1;
	ctx.strokeStyle = player.reverseColor;
	ctx.strokeRect(player.x - 1, player.y - 1, player.width + 2, player.height + 2);
	ctx.closePath();
}

function	drawBall(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, ball : Ball)
{
	ctx.beginPath();
	ctx.fillStyle = ball.color;
	ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
	ctx.fill();
	ctx.strokeStyle = ball.reverseColor;
	ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
	ctx.stroke();
	ctx.closePath();
}

function	drawScore(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, player: Player, left: boolean)
{
	ctx.beginPath();
	ctx.fillStyle = player.reverseColor;
	ctx.font = "430% cursive";
	if (left === true)
	{
		ctx.fillText(player.score.toString(), (canvas.width * 5) / 100, (canvas.height * 15) / 100);
		ctx.fillStyle = player.color;
		ctx.font = "400% cursive";
		ctx.fillText(player.score.toString(), (canvas.width * 5) / 100, (canvas.height * 15) / 100);
	}
	else
	{
		ctx.fillText(player.score.toString(), (canvas.width * 91) / 100, (canvas.height * 15) / 100);
		ctx.fillStyle = player.color;
		ctx.font = "400% cursive";
		ctx.fillText(player.score.toString(), (canvas.width * 91) / 100, (canvas.height * 15) / 100);
	}
	ctx.closePath();
}

function draw2d(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, ball : Ball, player1 : Player, player2 : Player, image: any)
{
	drawBackground(canvas, ctx, image);
	drawLineCircle(canvas, ctx, ball);
	drawScore(canvas, ctx, player1, true);
	drawScore(canvas, ctx, player2, false);
	drawPlayer(canvas, ctx, player1);
	drawPlayer(canvas, ctx, player2);
	drawBall(canvas, ctx, ball);
}

export default function Prepare(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, ball: Ball, player1: Player, player2: Player, image: any)
{
    draw2d(canvas, ctx, ball, player1, player2,image);
}
