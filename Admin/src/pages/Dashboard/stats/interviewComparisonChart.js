import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const asArray = value => (Array.isArray(value) ? value : []);

const InterviewComparisonChart = ({ assignedData, attemptedData }) => {
    const mergedData = useMemo(() => {
        const assigned = asArray(assignedData?.technologyWiseCounts);
        const attempted = asArray(attemptedData?.technologyWiseCounts);

        const technologyMap = {};

        assigned.forEach(item => {
            technologyMap[item.technology] = {
                technology: item.technology,
                Assigned: item.count,
                Attempted: 0,
            };
        });

        attempted.forEach(item => {
            if (technologyMap[item.technology]) {
                technologyMap[item.technology].Attempted = item.count;
            } else {
                technologyMap[item.technology] = {
                    technology: item.technology,
                    Assigned: 0,
                    Attempted: item.count,
                };
            }
        });

        return Object.values(technologyMap);
    }, [assignedData, attemptedData]);

    return (
        <div style={{ width: '100%', height: 400, maxWidth: '600px', margin: 'auto' }}>
            <ResponsiveContainer>
                <BarChart data={mergedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    width={600}
                    height={400}
                    barCategoryGap="10%"
                    barGap={5}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="technology"
                        angle={-30}
                        textAnchor="end"
                        interval={0}
                        height={60}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Assigned" fill="#8884d8" barSize={25} />
                    <Bar dataKey="Attempted" fill="#82ca9d" barSize={25} />
                </BarChart>
            </ResponsiveContainer>
        </div>

    );
};

InterviewComparisonChart.propTypes = {
    assignedData: PropTypes.object,
    attemptedData: PropTypes.object,
};

export default InterviewComparisonChart;
