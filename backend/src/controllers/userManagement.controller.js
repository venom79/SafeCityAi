import prisma from "../db/prisma.js"

export const getUsers = async (req, res) => {

  try {

    const { role, status, search } = req.query

    const where = {}

    if (role) {
      where.role = role
    }

    if (status === "ACTIVE") {
      where.is_active = true
    }

    if (status === "BANNED") {
      where.is_active = false
    }

    if (search) {

      where.OR = [
        {
          full_name: {
            contains: search,
            mode: "insensitive"
          }
        },
        {
          email: {
            contains: search,
            mode: "insensitive"
          }
        }
      ]

    }

    const users = await prisma.users.findMany({
      where,
      orderBy: {
        created_at: "desc"
      },
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        is_active: true
      }
    })

    const formatted = users.map(u => ({
      id: u.id,
      name: u.full_name,
      email: u.email,
      role: u.role,
      status: u.is_active ? "ACTIVE" : "BANNED"
    }))

    res.json({
      success: true,
      data: formatted
    })

  } catch (err) {

    console.error(err)

    res.status(500).json({
      success: false,
      message: "Failed to fetch users"
    })

  }

}

export const toggleUserBan = async (req, res) => {

  try {

    const userId = req.params.id

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        is_active: true
      }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    const updated = await prisma.users.update({
      where: { id: userId },
      data: {
        is_active: !user.is_active
      }
    })

    res.json({
      success: true,
      status: updated.is_active ? "ACTIVE" : "BANNED"
    })

  } catch (err) {

    console.error(err)

    res.status(500).json({
      success: false,
      message: "Failed to update user"
    })

  }

}

export const getAdmins = async (req, res) => {

  try {

    const admins = await prisma.users.findMany({
      where: {
        role: "ADMIN",
        is_active: true
      },
      orderBy: {
        full_name: "asc"
      },
      select: {
        id: true,
        full_name: true
      }
    })

    res.json({
      success: true,
      data: admins
    })

  } catch (err) {

    console.error(err)

    res.status(500).json({
      success: false,
      message: "Failed to fetch admins"
    })

  }

}