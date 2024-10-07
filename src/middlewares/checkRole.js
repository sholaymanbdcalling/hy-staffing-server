const checkRole = (roles) => {
    return (req, res, next) => {
        const userRole = req.user.role;
        console.log(userRole);

        if (!roles.includes(userRole)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // console.log([roles]); // This might log '[ 'super admin,admin' ]'
        next();
    };
};

export { checkRole };