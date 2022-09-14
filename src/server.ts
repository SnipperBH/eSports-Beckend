import express from 'express'
import cors  from 'cors';
import { PrismaClient } from '@prisma/client';
import { convertHours } from './utils/convert-hours';
import { convertMinutes } from './utils/convert-minutes';

const app = express()

app.use(express.json())

app.use(cors())

const prisma = new PrismaClient()

app.get('/games', async (req, res) => {
    const games = await prisma.game.findMany({
        include: {
            _count: {
                select: {
                    ads: true
                }
            }
        }
    })
    return res.json(games);
});

app.post('/games/:id/ads', async (req, res) => {
    const gameId = req.params.id;
    const body: any = req.body;

    const ad = await prisma.ad.create({
        data: {
            gameId,
            name: body.name,
            yearsPlaying: body.yearsPlaying,
            discord: body.discord,
            weekDays: body.weekDays,
            hourStart: convertMinutes(body.hourStart),
            hoursEnd: convertMinutes(body.hoursEnd),
            useVoiceChannel: body.useVoiceChannel
        }
    })

    return res.status(201).json(ad);
});

app.get('/games/:id/ads', async (req, res) => {
    let gameId = req.params.id;

    let ads = await prisma.ad.findMany({
        select: {
            id: true,
            name: true,
            weekDays: true,
            useVoiceChannel: true,
            yearsPlaying: true,
            hourStart: true,
            hoursEnd: true,
        },
        where: {
            gameId,
        },
        orderBy: {
            createdAt: 'desc',
        }
    })
    return res.json(ads.map(ad => {
        return {
            ...ad,
            hourStart: convertHours(ad.hourStart),
            hoursEnd: convertHours(ad.hoursEnd),
        }
    }))
})

app.get('/ads/:id/discord', async (req, res) => {
    const adId = req.params.id;

    const ad = await prisma.ad.findUniqueOrThrow({
        select:{
            discord : true,
        },
        where: {
            id: adId,
        }
    })
    return res.json({
        discord : ad.discord,
    })
});

app.listen(3333)